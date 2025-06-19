import React, {useEffect, useState, useLayoutEffect} from 'react';
import moment from 'moment';
import * as Constants from '../../../../CommonConfig/Constants';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import {useSelector, useDispatch} from 'react-redux';
import {TouchableOpacity, Image} from 'react-native';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {IndexContext} from '../../../../Context/IndexContext';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import {getAllOrderItems} from '../../../../Helper/OrderHelper';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import {createAction} from '../../../../Actions/CreateActions';
import * as ActionType from '../../../../Actions/ActionTypes';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import {PODHelper} from '../../../../Helper/PODHelper';

export const useRemark = (route, navigation) => {
  const job = route.params.job;
  const step = route.params.step;
  // use to define photo taking flow else it is exception or normal photo take
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;
  const needScanSku = route.params.needScanSku;
  let batchJob = route.params.batchJob;

  const [actionModel, setActionModel] = useState(route.params.actionModel);
  const [remarkTitle, setRemarkTitle] = useState(
    step?.stepRemark ? step.stepRemark : '',
  );
  const [remark, setRemark] = useState('');
  const [orderList, setOrderList] = useState([]);
  const [orderItemList, setOrderItemList] = useState([]);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const dispatch = useDispatch();
  let filterTimeout;

  const {batchJobActionMapper} = PODHelper();

  const isSkipSummary = route.params?.isSkipSummary
    ? route.params?.isSkipSummary
    : false;

  const remarkOnChangeText = (text) => {
    setRemark(text);
  };

  const confirmButtonOnPressed = () => {
    actionModel.remark = remark;
    switch (actionModel.actionType) {
      case Constants.ActionType.PARTIAL_DLEIVER_FAIL:
        navigation.navigate('PartialDeliveryAction', {
          job: job,
          stepCode: step.stepCode,
          actionModel: actionModel,
          photoTaking: photoTaking,
          needScanSku: needScanSku,
          isSkipSummary: isSkipSummary,
        });

        break;

      case Constants.ActionType.COLLECT_SUCCESS:
        navigation.navigate('CollectAction', {
          job: job,
          stepCode: step.stepCode,
          consigneeName: JobHelper.getConsignee(job, false),
          trackNumModel: JobHelper.getTrackingNumberOrCount(job),
          actionModel: actionModel,
          photoTaking: photoTaking,
        });
        break;

      default:
        handleNavigation();
        break;
    }
  };

  const updatePhotoSyncStatusByAction = async (actionModelSelected) => {
    try {
      await PhotoHelper.updatePhotoSyncStatusByAction(
        actionModelSelected,
        epodRealm,
      );
    } catch (error) {
      alert('Update Photo SyncStatus: ' + error);
    }
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

  const handleNavigation = async () => {
    if (needScanSku) {
      const allOrderItems = getAllOrderItems(epodRealm, orderList, job.id);
      const allWithoutSku = allOrderItems.every((e) => !e.skuCode);
      if (allWithoutSku) {
        const scannedOrderItemsWithScannedTime = allOrderItems.map((e) => {
          return {
            ...e,
            scanSkuTime: moment().format(),
          };
        });
        navigation.navigate('ScanSkuItems', {
          orderItems: scannedOrderItemsWithScannedTime,
          job: job,
          actionModel: actionModel,
          photoTaking: photoTaking,
          stepCode: step.stepCode,
          orderList: orderList,
        });
      } else {
        const payload = {
          orderItems: [],
        };
        dispatch(createAction(ActionType.UPDATE_SKU_ORDER_ITEMS, payload));
        navigation.navigate('ScanSku', {
          job: job,
          actionModel: actionModel,
          photoTaking: photoTaking,
          stepCode: step.stepCode,
          orderList: orderList,
        });
      }
    } else if (job.codAmount && job.codAmount > 0) {
      navigation.navigate('CodAction', {
        job: job,
        stepCode: step.stepCode,
        orderList: orderList,
        actionModel: actionModel,
        photoTaking: photoTaking,
      });
    } else {
      switch (step.stepCode) {
        case Constants.StepCode.BARCODE_POD:
        case Constants.StepCode.BARCODEESIGN_POD:
          navigation.navigate('ScanQr', {
            job: job,
            stepCode: step.stepCode,
            orderList: orderList,
            actionModel: actionModel,
            photoTaking: photoTaking,
          });
          break;

        case Constants.StepCode.ESIGN_POD:
        case Constants.StepCode.ESIGNBARCODE_POD:
          navigation.navigate('Esign', {
            job: job,
            stepCode: step.stepCode,
            action: actionModel,
            photoTaking: photoTaking,
          });
          break;

        default:
          const tempActionModels = [];
          if (batchJob && batchJob.length > 0) {
            await batchJobActionMapper(
              job.id,
              actionModel,
              step.stepCode,
              batchJob,
              photoTaking,
            );
          } else {
            addNewAction(actionModel);
            updateJobInLocalDb(job, step.stepCode, actionModel, true);
          }

          if (tempActionModels && tempActionModels.length > 0) {
            await PhotoHelper.updatePhotoSyncStatusByActionAndCloneToBatchAction(
              actionModel,
              tempActionModels,
              epodRealm,
            );
          } else {
            await updatePhotoSyncStatusByAction(actionModel);
          }
          // if (isJobUpdated) {
          let payload = {
            isRefresh: true,
          };
          dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
          navigation.popToTop();
          if (networkModel.isConnected) {
            startActionSync();
          }

          break;
      }
    }
  };

  const addNewAction = async (actionModel) => {
    try {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        ActionRealmManager.insertNewAction(actionModel, epodRealm);
      }, 1000);
    } catch (error) {
      alert('Add Action Error: ' + error);
    }
  };

  useEffect(() => {
    initValue();
  }, []);

  const initValue = async () => {
    let tempOrderList = [];
    let tempOrderItemList = [];
    let normalSku = [];
    let expensiveSku = [];
    let containerSku = [];

    const orderList = OrderRealmManager.getOrderByJodId(job.id, epodRealm);

    if (orderList && orderList.length > 0) {
      let tempActionModel = actionModel;
      tempActionModel.orderId = orderList[0].id;

      orderList.map((orderModel) => {
        const tempOrderModel =
          GeneralHelper.convertRealmObjectToJSON(orderModel);
        tempOrderList.push(tempOrderModel);

        let seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
          orderModel.id,
          epodRealm,
        );

        seletedOrderItems = seletedOrderItems.filter(() => true);

        seletedOrderItems.map((item) => {
          let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);

          orderItemModel.quantity = item.expectedQuantity - item.quantity;

          if (orderItemModel.quantity && orderItemModel.quantity > 0) {
            orderItemModel.expectedQuantity = orderItemModel.quantity;
            orderItemModel.orderNumber = orderModel.orderNumber;
            if (orderItemModel.isExpensive === true) {
              expensiveSku.push(orderItemModel);
            } else {
              normalSku.push(orderItemModel);
            }
            // tempOrderItemList.push(orderItemModel);
          }
        });
      });

      let selectedContainer = JobRealmManager.getJobContainersByJobId(
        job.id,
        epodRealm,
      );

      if (selectedContainer && selectedContainer.length > 0) {
        selectedContainer.map((item) => {
          let containerItemModel = GeneralHelper.convertRealmObjectToJSON(item);

          containerItemModel.quantity = item.expectedQuantity - item.quantity;

          if (containerItemModel.quantity && containerItemModel.quantity > 0) {
            containerItemModel.expectedQuantity = containerItemModel.quantity;
            containerItemModel.orderNumber = '';
            containerSku.push(containerItemModel);
          }
        });
      }

      if (expensiveSku) {
        tempOrderItemList.push(...expensiveSku);
      }

      if (containerSku) {
        tempOrderItemList.push(...containerSku);
      }

      tempOrderItemList.push(...normalSku);

      setOrderList(tempOrderList);
      setOrderItemList(tempOrderItemList);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <TouchableOpacity
            style={Constants.navStyles.navButton}
            onPress={async () => {
              navigation.goBack();
            }}>
            <Image source={BackButton} />
          </TouchableOpacity>
        );
      },
      headerTitle: remarkTitle,
      headerRight: null,
    });
  }, [navigation]);

  return {remarkTitle, remarkOnChangeText, remark, confirmButtonOnPressed};
};
