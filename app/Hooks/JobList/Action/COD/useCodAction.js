/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import * as Constants from '../../../../CommonConfig/Constants';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import {PODHelper} from '../../../../Helper/PODHelper';

export const useCodAction = (route, navigation) => {
  const job = route.params.job;
  const stepCode = route.params.stepCode;
  const networkModel = useSelector((state) => state.NetworkReducer);
  const locationModel = useSelector((state) => state.LocationReducer);
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const [actionModel, setActionModel] = useState(route.params.actionModel);
  const [orderList, setOrderList] = useState(route.params.orderList);
  const [orderItemList, setOrderItemList] = useState([]);
  const [totalExpectedCodAmt, setTotalExpectedCodAmt] = useState(0);
  const [totalActualCodAmt, setTotalActualCodAmt] = useState(0);
  const [isEmptyCodValue, setIsEmptyCodValue] = useState(false);
  const [isShowModalVisible, setIsShowModalVisible] = useState(false);

  let batchJob = route.params.batchJob;

  const {batchJobActionMapper} = PODHelper();

  const dispatch = useDispatch();
  // use to define photo taking flow else it is exception or normal photo take
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;
  const scannedSkuOrderItems = route.params.scannedOrderItems;

  const refreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }
    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    navigation.popToTop();
  };

  const generateAdditionalParamsJson = () => {
    let codValueList = [];
    orderList.map((item) => {
      const codModel = {
        codAmount: item.codAmount,
        codCurrency: item.codCurrency,
        codValue: item.codValue,
        orderId: item.id,
        orderNumber: item.orderNumber,
      };
      codValueList.push(codModel);
    });
    const additionParams = {
      codCurrency: job.codCurrency,
      codReason: -1,
      totalCod: totalActualCodAmt,
      codValueList: codValueList,
    };
    return JSON.stringify(additionParams);
  };

  const updateJobInLocalDb = async (
    jobModel,
    currentStepCode,
    actionModel,
    isSuccess,
  ) => {
    try {
      JobHelper.updateJob(
        jobModel,
        currentStepCode,
        actionModel,
        isSuccess,
        epodRealm,
      );
      return true;
    } catch (error) {
      alert('Update Job Error: ' + error);
      return false;
    }
  };

  const completeSimplePod = async (reasonId) => {
    if (actionModel.actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL) {
      let jobModel = job;
      let tempActionModel = actionModel;
      tempActionModel.additionalParamsJson =
        ActionHelper.generateCODAdditionalParamsJson(
          orderList,
          job,
          totalActualCodAmt,
          reasonId,
        );
      let tempOrderList = orderList;
      let tempOrderItemList = orderItemList;
      await ActionHelper.insertPartialDeliveryActionAndOrderItem(
        jobModel,
        tempActionModel,
        tempOrderList,
        tempOrderItemList,
        epodRealm,
        false,
        photoTaking,
      );

      await updatePhotoStatus(tempActionModel);
      refreshJobList();
    } else {
      const isSuccess = true;

      let action = actionModel
        ? actionModel
        : ActionHelper.generateActionModel(
            job.id,
            stepCode,
            isSuccess,
            locationModel,
            generateAdditionalParamsJson(),
            photoTaking,
          );

      if (action) {
        action.additionalParamJson = generateAdditionalParamsJson();
        if (photoTaking) {
          action.syncPhoto = Constants.SyncStatus.SYNC_PENDING;
        }
      }

      if (batchJob && batchJob.length > 0) {
        await batchJobActionMapper(
          job.id,
          action,
          stepCode,
          batchJob,
          true,
          true,
          orderList,
        );
        refreshJobList();
      } else {
        if (orderList && orderList.length > 0) {
          action.orderId = orderList[0].id;
        }

        if (orderItemList.some((item) => item.scanSkuTime !== '')) {
          action.syncItem = Constants.SyncStatus.SYNC_PENDING;
        }

        await updatePhotoStatus(action);

        await ActionRealmManager.insertNewAction(action, epodRealm);

        await ActionHelper.insertScanSkuActionAction(
          action,
          orderItemList,
          epodRealm,
        );

        const isJobUpdated = await updateJobInLocalDb(
          job,
          stepCode,
          action,
          isSuccess,
        );

        if (isJobUpdated) {
          refreshJobList();
        }
      }

      await AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
    }
  };

  const completeBarCodePod = (reasonId) => {
    const additionalParamsJson = generateAdditionalParamsJson();

    AsyncStorage.setItem(
      Constants.PENDING_ACTION_LIST,
      JSON.stringify(actionModel),
    );

    if (actionModel.actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL) {
      navigation.navigate('ScanQr', {
        job: job,
        isPD: true,
        additionalParamsJson: additionalParamsJson,
        codReasonCode: reasonId,
        stepCode: stepCode,
        orderList: orderList,
        orderItemList: orderItemList,
        actionModel: actionModel,
        totalActualCodAmt: totalActualCodAmt,
        photoTaking,
        batchJob: batchJob,
      });
    } else {
      navigation.navigate('ScanQr', {
        job: job,
        isPD: false,
        additionalParamsJson: additionalParamsJson,
        codReasonCode: reasonId,
        stepCode: stepCode,
        orderList: orderList,
        orderItemList: orderItemList,
        actionModel: actionModel,
        totalActualCodAmt: totalActualCodAmt,
        photoTaking,
        batchJob: batchJob,
      });
    }
  };

  const completeEsignPod = (reasonId) => {
    const additionalParamsJson = generateAdditionalParamsJson();

    if (actionModel.actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL) {
      if (additionalParamsJson) {
        actionModel.additionalParamsJson = additionalParamsJson;
      }
      navigation.navigate('Esign', {
        job: job,
        action: actionModel,
        stepCode: stepCode,
        orderList: orderList,
        orderItemList: orderItemList,
        totalActualCodAmt: totalActualCodAmt,
        photoTaking: photoTaking,
      });
    } else {
      const isSuccess = true;
      let action = ActionHelper.generateActionModel(
        job.id,
        stepCode,
        isSuccess,
        locationModel,
        additionalParamsJson,
        photoTaking,
      );

      if (actionModel && photoTaking) {
        action.guid = actionModel.guid;
        action.remark = actionModel.remark;
        action.needScanSku = actionModel.needScanSku;
      }

      navigation.navigate('Esign', {
        job: job,
        action: action,
        stepCode: stepCode,
        orderList: orderList,
        orderItemList: orderItemList,
        totalActualCodAmt: totalActualCodAmt,
        photoTaking: photoTaking,
      });
    }
  };

  const completeEsignPoc = (reasonId) => {
    const additionalParamsJson = generateAdditionalParamsJson();

    if (actionModel.actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL) {
      if (additionalParamsJson) {
        actionModel.additionalParamsJson = additionalParamsJson;
      }
      navigation.navigate('Esign', {
        job: job,
        action: actionModel,
        stepCode: stepCode,
        orderList: orderList,
        orderItemList: orderItemList,
        totalActualCodAmt: totalActualCodAmt,
        photoTaking: photoTaking,
      });
    } else {
      const isSuccess = true;
      let action = ActionHelper.generateActionModel(
        job.id,
        stepCode,
        isSuccess,
        locationModel,
        additionalParamsJson,
        photoTaking,
      );

      if (actionModel && photoTaking) {
        action.guid = actionModel.guid;
        action.remark = actionModel.remark;
        action.needScanSku = actionModel.needScanSku;
      }

      navigation.navigate('Esign', {
        job: job,
        action: action,
        stepCode: stepCode,
        orderList: orderList,
        orderItemList: orderItemList,
        totalActualCodAmt: totalActualCodAmt,
        photoTaking: photoTaking,
      });
    }
  };

  const completeCollect = async (reasonId) => {
    let tempActionModel = actionModel;
    tempActionModel.additionalParamsJson =
      ActionHelper.generateCODAdditionalParamsJson(
        orderList,
        job,
        totalActualCodAmt,
        reasonId,
      );

    await ActionHelper.insertCollectActionAndOrderItem(
      job,
      tempActionModel,
      orderList,
      orderItemList,
      epodRealm,
    );
    await updatePhotoStatus(tempActionModel);

    refreshJobList();
  };

  const updatePhotoStatus = async (actionModel) => {
    if (photoTaking) {
      // update photo status for action with photo flow for pending upload
      await PhotoHelper.updatePhotoSyncStatusByAction(actionModel, epodRealm);
    }
  };

  const checkStepCode = (reasonId) => {
    let jobModel = job;
    jobModel.additionalParamJson = totalActualCodAmt;
    switch (stepCode) {
      case Constants.StepCode.SIMPLE_POD:
        completeSimplePod(reasonId);
        break;
      case Constants.StepCode.BARCODE_POD:
      case Constants.StepCode.BARCODEESIGN_POD:
        completeBarCodePod(reasonId);
        break;
      case Constants.StepCode.ESIGN_POD:
      case Constants.StepCode.ESIGNBARCODE_POD:
        completeEsignPod(reasonId);
        break;
      case Constants.StepCode.COLLECT:
        completeCollect(reasonId);
        break;
      case Constants.StepCode.ESIGN_POC:
        completeEsignPoc(reasonId);
        break;
      default:
        break;
    }
  };

  const modalCancelButtonOnPressed = () => {
    setIsShowModalVisible(false);
  };

  const modalConfirmButtonOnPressed = () => {
    setIsShowModalVisible(false);
    if (totalActualCodAmt !== totalExpectedCodAmt) {
      navigation.navigate('CodReason', {
        job: job,
        reasonType: Constants.ReasonType.COD_REASON,
        actionModel: actionModel,
        stepCode: stepCode,
        onCodReasonComplete: checkStepCode,
      });
    } else {
      checkStepCode(-1);
    }
  };

  const completeButtonOnPressed = () => {
    if (isEmptyCodValue) {
      alert('COD amount cannot be empty.');
    } else {
      setIsShowModalVisible(true);
      let tempTotal = 0;
      orderList.map((orderItem) => {
        orderItem.codValue = parseFloat(orderItem.codValueString);
        tempTotal += parseFloat(orderItem.codValue);
      });
      setTotalActualCodAmt(tempTotal);
    }
  };

  const callButtonOnPressed = () => {
    GeneralHelper.makePhoneCall(job.csPhoneNo);
  };

  const codValueOnChange = (text, item, index) => {
    let tempOrderList = orderList;
    if (text.substring(0, 4) === '0.00') {
      text = text.substring(3);
    }

    setIsEmptyCodValue(text === '');

    item.codValueString = text;
    tempOrderList = [
      ...tempOrderList.slice(0, index),
      item,
      ...tempOrderList.slice(index + 1),
    ];

    setOrderList(tempOrderList);
    // }
  };

  const onEndEditCodValue = (text, item, index) => {
    let tempOrderList = orderList;
    let tempTotal = 0;
    let inputCodValue = text;

    if (text === '') {
      alert('COD amount cannot be empty.');
      setIsEmptyCodValue(true);
    } else {
      const reg = /^\d*\.?\d*$/;
      let isValidInput = reg.test(text);
      if (isValidInput) {
        inputCodValue = parseFloat(text).toFixed(2);
        item.codValueString = `${inputCodValue}`;
      } else {
        item.codValueString = '';
      }

      tempOrderList = [
        ...tempOrderList.slice(0, index),
        item,
        ...tempOrderList.slice(index + 1),
      ];
      tempOrderList.map((orderItem) => {
        orderItem.codValue = parseFloat(orderItem.codValueString);
        tempTotal += parseFloat(orderItem.codValue);
      });
      setTotalActualCodAmt(tempTotal);
      setOrderList(tempOrderList);
      setIsEmptyCodValue(false);
    }
  };

  // completed ESIGN_POD &  completed POD not editable
  const getIsNotEditable = () => {
    return (
      (stepCode === Constants.StepCode.ESIGN_POD ||
        stepCode === Constants.StepCode.SIMPLE_POD ||
        stepCode === Constants.StepCode.BARCODE_POD) &&
      actionModel.actionType !== Constants.ActionType.PARTIAL_DLEIVER_FAIL &&
      actionModel.actionType !== Constants.ActionType.ESIGNATURE_POD &&
      actionModel.actionType !== Constants.ActionType.BARCODE_POD
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight: null,
      headerTitle:
        job.jobType === Constants.JobType.PICK_UP
          ? translationString.confirm_coc
          : translationString.confirm_cod,
      headerStyle: {
        backgroundColor:
          job.jobType === Constants.JobType.PICK_UP
            ? Constants.Pending_Color
            : Constants.THEME_COLOR,
        shadowColor: 'transparent',
        shadowRadius: 0,
        shadowOffset: {
          height: 0,
        },
        elevation: 0,
      },
    });
  }, [navigation]);

  useEffect(() => {
    let tempPendingActionList = [];
    if (actionModel) {
      tempPendingActionList.push(actionModel);
      AsyncStorage.setItem(
        Constants.PENDING_ACTION_LIST,
        JSON.stringify(tempPendingActionList),
      );
    }

    let tempOrderList = [];
    let tempOrderItemList = route.params?.orderItemList
      ? route.params?.orderItemList
      : [];
    let totalSum = 0;

    let normalSku = [];
    let expensiveSku = [];
    let containerSku = [];

    let temporderList = [];
    let selectedContainer = [];

    if (batchJob && batchJob.length > 0) {
      temporderList = [];
      for (var i of batchJob) {
        const jobOrderList = OrderRealmManager.getOrderByJodId(i.id, epodRealm);
        temporderList.push(...jobOrderList);

        const tempSelectedContainer = JobRealmManager.getJobContainersByJobId(
          job.id,
          epodRealm,
        );
        selectedContainer.push(...tempSelectedContainer);
      }
    } else {
      temporderList.push(...orderList);
      selectedContainer = JobRealmManager.getJobContainersByJobId(
        job.id,
        epodRealm,
      );
    }

    temporderList = temporderList.sort((a, b) => b.codAmount - a.codAmount);

    temporderList.map((item) => {
      let orderModel = GeneralHelper.convertRealmObjectToJSON(item);
      orderModel.codValue = item.codAmount;
      orderModel.isNotEditable = !getIsNotEditable();
      orderModel.codValueString = `${item.codAmount}`;
      tempOrderList.push(orderModel);
      totalSum += item.codAmount;
      if (!route.params?.orderItemList) {
        let seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
          item.id,
          epodRealm,
        );

        seletedOrderItems = seletedOrderItems.filter(() => true);
        seletedOrderItems.map((itemModel) => {
          let orderItemModel =
            GeneralHelper.convertRealmObjectToJSON(itemModel);

          orderItemModel.quantity =
            itemModel.expectedQuantity - itemModel.quantity;

          orderItemModel.expectedQuantity = orderItemModel.quantity;

          if (scannedSkuOrderItems !== undefined) {
            const scanned = scannedSkuOrderItems.find(
              (itemValue) => itemValue.id === orderItemModel.id,
            );

            if (scanned) {
              orderItemModel.scanSkuTime = scanned.scanSkuTime;
              orderItemModel.quantity = scanned.quantity;

              if (orderItemModel.isExpensive === true) {
                expensiveSku.push(orderItemModel);
              } else {
                normalSku.push(orderItemModel);
              }
              // tempOrderItemList.push(orderItemModel);
            }
          } else {
            if (orderItemModel.isExpensive === true) {
              expensiveSku.push(orderItemModel);
            } else {
              normalSku.push(orderItemModel);
            }
            // tempOrderItemList.push(orderItemModel);
          }
        });
      }
    });

    if (selectedContainer && selectedContainer.length > 0) {
      selectedContainer.map((itemModel) => {
        let containerItemModel =
          GeneralHelper.convertRealmObjectToJSON(itemModel);
        containerItemModel.quantity =
          itemModel.expectedQuantity - itemModel.quantity;
        containerItemModel.expectedQuantity = containerItemModel.quantity;
        containerSku.push(containerItemModel);
      });
    }

    if (expensiveSku) {
      tempOrderItemList.push(...expensiveSku);
    }

    if (containerSku) {
      tempOrderItemList.push(...containerSku);
    }

    tempOrderItemList.push(...normalSku);

    setOrderItemList(tempOrderItemList);
    setOrderList(tempOrderList);
    setTotalExpectedCodAmt(totalSum);
    setTotalActualCodAmt(totalSum);
  }, []);

  return {
    callButtonOnPressed,
    completeButtonOnPressed,
    codValueOnChange,
    onEndEditCodValue,
    getIsNotEditable,
    modalCancelButtonOnPressed,
    modalConfirmButtonOnPressed,
    job,
    orderList,
    totalExpectedCodAmt,
    totalActualCodAmt,
    isShowModalVisible,
  };
};
