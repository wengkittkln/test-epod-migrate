/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image, BackHandler} from 'react-native';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import {useSelector, useDispatch, batch} from 'react-redux';
import * as Constants from '../../../../CommonConfig/Constants';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import * as CustomerStepRealmManager from '../../../../Database/realmManager/CustomerStepRealmManager';
import * as PhotoRealmManager from '../../../../Database/realmManager/PhotoRealmManager';
import * as ReasonRealmManager from '../../../../Database/realmManager/ReasonRealmManager';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import {PODHelper} from '../../../../Helper/PODHelper';
import {useScanQr} from './../ScanQr/useScanQr';

export const useSelectReason = (route, navigation) => {
  const job = route.params.job;
  const jobBin = route.params.jobBin;
  const reasonType = route.params.reasonType;
  const stepCode = route.params.stepCode;
  const needScanSku = route.params.needScanSku;
  const batchJob = route.params.batchJob;
  const additionalParamsJson = route.params?.additionalParamsJson
    ? route.params.additionalParamsJson
    : '';
  const orderList = route.params?.orderList;
  const orderItemList = route.params?.orderItemList;
  const method = route.params?.method;
  const from = route.params?.from;
  const isVerified = route.params?.isVerified ? route.params.isVerified : false;
  const cameraModel = useSelector((state) => state.CameraReducer);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const locationModel = useSelector((state) => state.LocationReducer);
  const otherReasonId = -1;
  const partialDeliveryID = -2;
  const [actionModel, setActionModel] = useState(route.params.actionModel);
  const [pendingActionList, setPendingActionList] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState(0);
  const [otherReason, setOtherReason] = useState('');
  const [datalist, setDatalist] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [isLoading, setIsLoading] = useState(0);

  const {startActionSync} = React.useContext(ActionSyncContext);
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const dispatch = useDispatch();
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;

  const isGeneralPhotoTaking = route.params?.isGeneralPhotoTaking
    ? route.params.isGeneralPhotoTaking
    : false;

  const isSkipSummary = route.params?.isSkipSummary
    ? route.params?.isSkipSummary
    : false;

  const {batchJobActionMapper} = PODHelper();
  const [scanQrResult, setScanQrResult] = useState(
    route.params?.scanResult ? route.params?.scanResult : '',
  );

  const [scanQRReasonId, setScanQRReasonId] = useState(0);

  let filterTimeout;

  const {processBarCodePOD} = useScanQr(route, navigation);

  const gotoCameraScreen = async () => {
    await updatePhotoSyncStatusByAction();
    navigation.navigate('Camera');
  };

  const updatePhotoSyncStatusByAction = async () => {
    try {
      await PhotoRealmManager.updatePhotoSyncStatusByAction(
        actionModel.guid,
        Constants.SyncStatus.PENDING_SELECT_PHOTO,
        epodRealm,
      );
    } catch (error) {
      alert('Update Photo SyncStatus: ' + error);
    }
  };

  const otherReasonOnChangeText = (text) => {
    setOtherReason(text);
  };

  const scannedQRContentOnChangeText = (text) => {
    setScanQrResult(text);
  };

  const itemOnPressed = (reasonId, item) => {
    setSelectedReasonId(reasonId);
    setOtherReason('');
    setScanQrResult('');

    if (item.reasonAction === Constants.ReasonAction.NEED_SCANQR) {
      setScanQRReasonId(reasonId);
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

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
    navigation.popToTop();
    if (!from) {
      navigation.popToTop();
    } else {
      let consigneeName = JobHelper.getConsignee(job, false);
      let trackNumModel = JobHelper.getTrackingNumberOrCount(job);

      navigation.navigate(from, {
        job: job,
        consigneeName: consigneeName,
        stepCode: stepCode,
        batchJob: batchJob,
        trackNumModel: trackNumModel,
      });
    }
  };

  const confirmButtonOnPressed = async () => {
    if (
      !isGeneralPhotoTaking &&
      (stepCode === Constants.StepCode.BARCODE_POD ||
        stepCode === Constants.StepCode.BARCODEESIGN_POD) &&
      reasonType === Constants.ReasonType.BARCODEPOD_SKIP_REASON
    ) {
      barcodePODSkipPasscode();
    } else {
      normalProcess();
    }
  };

  const barcodePODSkipPasscode = async () => {
    let selectedReasonModel = datalist.find(
      (item) => item.id === selectedReasonId,
    );

    let tempActionModel = actionModel;

    let reasonDescription =
      selectedReasonId === otherReasonId
        ? otherReason
        : selectedReasonModel.description;

    tempActionModel.remark = reasonDescription;

    if (selectedReasonId === otherReasonId && otherReason.length === 0) {
      setAlertMsg(translationString.input_reason_title);
      return;
    }

    await processBarCodePOD(
      method,
      stepCode,
      actionModel,
      additionalParamsJson,
      photoTaking,
      job,
      orderList,
      orderItemList,
      route.params?.totalActualCodAmt,
    );
  };

  const normalProcess = async () => {
    let selectedReasonModel = datalist.find(
      (item) => item.id === selectedReasonId,
    );
    let tempActionModel = actionModel;
    let tempPendingActionList = pendingActionList;

    let reasonDescription =
      selectedReasonId === otherReasonId
        ? otherReason
        : selectedReasonModel.description;

    tempActionModel.reasonDescription = reasonDescription;

    if (reasonType === Constants.ReasonType.POD_EX) {
      tempActionModel.actionType = Constants.ActionType.POD_FAIL;
    }

    if (reasonType === Constants.ReasonType.POC_EX) {
      tempActionModel.actionType = Constants.ActionType.POC_FAIL;
    }

    if (selectedReasonId === otherReasonId && otherReason.length === 0) {
      setAlertMsg(translationString.input_reason_title);
      return;
    }

    if (tempActionModel.actionType === 1 && cameraModel.photos.length === 0) {
      setAlertMsg(translationString.missing_photo);
      return;
    }

    if (reasonType === Constants.ReasonType.JOB_TRANSFER_REASON) {
      navigation.navigate('JobTransferQr', {
        actionModel: tempActionModel,
      });
      return;
    }

    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );

    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    //POD fail > Select PD fail reason
    if (selectedReasonId === partialDeliveryID) {
      tempActionModel.actionType = Constants.ActionType.PARTIAL_DLEIVER_FAIL;
      if (tempPendingActionList.length > 0) {
        tempPendingActionList[tempPendingActionList.length - 1] =
          tempActionModel;
        setPendingActionList(tempPendingActionList);
        AsyncStorage.setItem(
          Constants.PENDING_ACTION_LIST,
          JSON.stringify(tempPendingActionList),
        );
      }

      navigation.navigate('PartialDeliveryReason', {
        job: job,
        reasonType: Constants.ReasonType.PARTIAL_DELIVERY_EX_REASON,
        actionModel: tempActionModel,
        stepCode: stepCode,
        needScanSku: needScanSku,
      });
      return;
    }

    //Partial Delivery
    if (reasonType === Constants.ReasonType.PARTIAL_DELIVERY_EX_REASON) {
      if (step.stepNeedPhoto) {
        navigation.navigate('PhotoFlowCamera', {
          job: job,
          stepCode: stepCode,
          actionModel: tempActionModel,
          photoTaking: step.stepNeedPhoto,
          needScanSku: needScanSku,
          isSkipSummary: isSkipSummary,
        });
      } else if (
        selectedReasonModel.reasonAction === Constants.ReasonAction.NEED_PHOTO
      ) {
        navigation.navigate('Camera', {
          job: job,
          actionModel: tempActionModel,
          stepCode: stepCode,
          isMaintainPhotoFlowPhoto: photoTaking,
          photoTaking: true,
          needScanSku: needScanSku,
          isSkipSummary: isSkipSummary,
        });
      } else if (needScanSku) {
        const payload = {
          orderItems: [],
        };
        dispatch(createAction(ActionType.UPDATE_SKU_ORDER_ITEMS, payload));
        navigation.navigate('ScanSku', {
          job: job,
          actionModel: tempActionModel,
          photoTaking: photoTaking,
          stepCode: stepCode,
          orderList: orderList,
          isPD: true,
          isSkipSummary: isSkipSummary,
        });
      } else {
        navigation.navigate('PartialDeliveryAction', {
          job: job,
          stepCode: stepCode,
          actionModel: tempActionModel,
          photoTaking: photoTaking,
          needScanSku: needScanSku,
          isSkipSummary: isSkipSummary,
        });
      }
      return;
    }

    //COD fail
    if (reasonType === Constants.ReasonType.COD_REASON) {
      if (route.params?.onCodReasonComplete) {
        route.params?.onCodReasonComplete(selectedReasonId);
      }
      return;
    }

    if (reasonType === Constants.ReasonType.POD_REASON) {
      if (route.params?.onPodReasonComplete) {
        route.params?.onPodReasonComplete(reasonDescription);
      }
      return;
    }

    if (reasonType === Constants.ReasonType.POC_REASON) {
      if (route.params?.onPocReasonComplete) {
        route.params?.onPocReasonComplete(reasonDescription);
      }
      return;
    }

    //General Call
    if (ActionHelper.isGeneralCall(tempActionModel.actionType)) {
      if (
        selectedReasonModel.reasonAction ===
        Constants.ReasonAction.NO_ADDITIONAL_ACTION
      ) {
        ActionHelper.noPhotoRequired(tempActionModel);
        const index = tempPendingActionList.findIndex(
          (action) => action.guid === tempActionModel.guid,
        );
        if (index !== -1) {
          tempPendingActionList[index] = tempActionModel;
        } else {
          tempPendingActionList.push(tempActionModel);
        }
        setPendingActionList(tempPendingActionList);
        AsyncStorage.setItem(
          Constants.PENDING_ACTION_LIST,
          JSON.stringify(tempPendingActionList),
        );
        if (
          tempActionModel.actionType === Constants.ActionType.GENERAL_CALL_FAIL
        ) {
          tempPendingActionList.map(async (pendingActionModel) => {
            if (orderList && orderList.length > 0) {
              pendingActionModel.orderId = orderList[0].id;
            }
            await addNewAction(pendingActionModel);
          });
          await JobHelper.updateJobForGeneralCall(job, epodRealm);
          actionSyncAndRefreshJobList();
        } else {
          navigation.navigate('PreCallAction', {
            job: job,
            consigneeName: route.params.consigneeName,
            stepCode: stepCode,
            actionModel: tempActionModel,
          });
        }
      } else {
        navigation.navigate('Camera', {
          job: job,
          actionModel: tempActionModel,
          stepCode: stepCode,
        });
      }
      return;
    }

    //Normal fail POD / Collection
    if (
      selectedReasonModel.reasonAction ===
        Constants.ReasonAction.NO_ADDITIONAL_ACTION ||
      (scanQrResult &&
        selectedReasonModel.reasonAction === Constants.ReasonAction.NEED_SCANQR)
    ) {
      if (batchJob && batchJob.length > 0) {
        setIsLoading(true);
        await batchJobActionMapper(
          job.id,
          tempActionModel,
          step.stepCode,
          batchJob,
          photoTaking || isGeneralPhotoTaking,
        );
        actionSyncAndRefreshJobList();
      } else {
        if (orderList && orderList.length > 0) {
          tempActionModel.orderId = orderList[0].id;
        }
        let isExist = await ActionHelper.checkForExsitingAction(
          actionModel,
          epodRealm,
        );

        if (scanQrResult) {
          tempActionModel.remark = scanQrResult;
        }

        if (!isExist) {
          await addNewAction(tempActionModel);
        }

        JobHelper.updateJobWithExceptionReason(
          job.id,
          tempActionModel,
          stepCode,
          epodRealm,
        );

        if (photoTaking) {
          // update photo status for action with photo flow for pending upload
          await PhotoHelper.updatePhotoSyncStatusByAction(
            tempActionModel,
            epodRealm,
          );
        }
        setIsLoading(false);
        actionSyncAndRefreshJobList();
      }
    } else if (
      selectedReasonModel.reasonAction === Constants.ReasonAction.NEED_SCANQR
    ) {
      navigation.navigate('ScanQr', {
        job: job,
        actionModel: tempActionModel,
        stepCode: stepCode,
        orderList: orderList,
        isExtraStep: true,
      });
    } else {
      setIsLoading(false);
      navigation.navigate('Camera', {
        job: job,
        actionModel: tempActionModel,
        stepCode: stepCode,
        isMaintainPhotoFlowPhoto: photoTaking,
        batchJob: batchJob,
      });
    }

    setIsLoading(false);
  };

  const getJobTransferReasonList = async () => {
    const reasonList =
      await ReasonRealmManager.getAllReasonByReasonTypeWithoutCustomer(
        Constants.ReasonType.JOB_TRANSFER_REASON,
        epodRealm,
      );
    return reasonList;
  };

  const getSkipBarcodePODReasonList = async () => {
    const reasonList =
      await ReasonRealmManager.getAllReasonByReasonTypeWithoutCustomer(
        Constants.ReasonType.BARCODEPOD_SKIP_REASON,
        epodRealm,
      );
    return reasonList;
  };

  const getPODReasonList = async () => {
    const reasonList =
      await ReasonRealmManager.getAllReasonByReasonTypeWithoutCustomer(
        Constants.ReasonType.POD_REASON,
        epodRealm,
      );
    return reasonList;
  };

  const getPOCReasonList = async () => {
    const reasonList =
      await ReasonRealmManager.getAllReasonByReasonTypeWithoutCustomer(
        Constants.ReasonType.POC_REASON,
        epodRealm,
      );
    return reasonList;
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (reasonType !== Constants.ReasonType.PRECALL_EX_REASON) {
          return (
            <TouchableOpacity
              style={Constants.navStyles.navButton}
              onPress={async () => {
                if (route.name === 'PhotoReason') {
                  await updatePhotoSyncStatusByAction();
                }
                navigation.goBack();
                AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
              }}>
              <Image source={BackButton} />
            </TouchableOpacity>
          );
        } else {
          return null;
        }
      },
      headerTitle:
        reasonType === Constants.ReasonType.PARTIAL_DELIVERY_EX_REASON
          ? translationString.please_select_partial_delivery_reason
          : translationString.select_reason,
      headerRight: null,
      gestureEnabled:
        reasonType !== Constants.ReasonType.PRECALL_EX_REASON ? true : false,
    });
  }, [navigation]);

  useEffect(() => {
    if (alertMsg) {
      setTimeout(() => {
        setAlertMsg('');
      }, 4000);
    }
  }, [alertMsg]);

  useEffect(() => {
    const scanResult = route.params?.scanResult ? route.params?.scanResult : '';

    setOtherReason(scanResult);
    setScanQrResult(scanResult);
  }, [route]);

  useEffect(() => {
    let tempPendingActionList = [];
    if (actionModel) {
      tempPendingActionList.push(actionModel);
      AsyncStorage.setItem(
        Constants.PENDING_ACTION_LIST,
        JSON.stringify(tempPendingActionList),
      );
    }

    // let reasonList = job.customer.reasons;
    // let tempReasonList = reasonList.filter((s) => s.reasonType === reasonType);
    // tempReasonList.sort((a, b) => a.id - b.id); //ascending

    // if (reasonType === Constants.ReasonType.POD_EX) {
    //   const quantity = orderItemQuantity();

    //   // only parcel more than one can partial delivery
    //   if (quantity > 1) {
    //     let partialDeliveryReason = {
    //       id: partialDeliveryID,
    //       description: translationString.partial_delivery,
    //       reasonAction: Constants.ReasonAction.NO_ADDITIONAL_ACTION, // deafult no photo
    //       reasonType: Constants.ReasonType.PARTIAL_DELIVERY_EX_REASON,
    //     };
    //     tempReasonList = [partialDeliveryReason].concat(tempReasonList);
    //   }
    // }

    let otherReasonModel = {
      id: otherReasonId,
      description: translationString.other,
      reasonAction: Constants.ReasonAction.NO_ADDITIONAL_ACTION, // deafult no photo
      reasonType: reasonType,
    };

    if (reasonType === Constants.ReasonType.JOB_TRANSFER_REASON) {
      getJobTransferReasonList().then((reasonList) => {
        let tempReasonList = [];
        reasonList.map((item) => {
          const reasonModel = GeneralHelper.convertRealmObjectToJSON(item);
          if (
            tempReasonList.filter((e) => e.description === item.description)
              .length === 0
          ) {
            tempReasonList.push(reasonModel);
          }
        });
        tempReasonList.push(otherReasonModel);
        setDatalist(tempReasonList);
        setActionModel(
          ActionHelper.generateJobTransferAction(true, locationModel),
        );
      });
    } else if (reasonType === Constants.ReasonType.BARCODEPOD_SKIP_REASON) {
      getSkipBarcodePODReasonList().then((reasonList) => {
        let tempReasonList = [];
        reasonList.map((item) => {
          const reasonModel = GeneralHelper.convertRealmObjectToJSON(item);
          if (
            tempReasonList.filter((e) => e.description === item.description)
              .length === 0
          ) {
            tempReasonList.push(reasonModel);
          }
        });
        tempReasonList.push(otherReasonModel);
        setDatalist(tempReasonList);
      });
    } else if (reasonType === Constants.ReasonType.POD_REASON) {
      getPODReasonList().then((reasonList) => {
        let tempReasonList = [];
        reasonList.map((item) => {
          const reasonModel = GeneralHelper.convertRealmObjectToJSON(item);
          if (
            tempReasonList.filter((e) => e.description === item.description)
              .length === 0
          ) {
            tempReasonList.push(reasonModel);
          }
        });
        tempReasonList.push(otherReasonModel);
        setDatalist(tempReasonList);
      });
    } else if (reasonType === Constants.ReasonType.POC_REASON) {
      getPOCReasonList().then((reasonList) => {
        let tempReasonList = [];
        reasonList.map((item) => {
          const reasonModel = GeneralHelper.convertRealmObjectToJSON(item);
          if (
            tempReasonList.filter((e) => e.description === item.description)
              .length === 0
          ) {
            tempReasonList.push(reasonModel);
          }
        });
        tempReasonList.push(otherReasonModel);
        setDatalist(tempReasonList);
      });
    } else {
      let reasonList = job.customer.reasons;
      let tempReasonList = reasonList.filter(
        (s) => s.reasonType === reasonType,
      );
      tempReasonList.sort((a, b) => a.id - b.id); //ascending

      if (
        (reasonType === Constants.ReasonType.POD_EX ||
          reasonType === Constants.ReasonType.POC_EX) &&
        (!batchJob || (batchJob && batchJob.length > 0))
      ) {
        const quantity = orderItemQuantity();

        // only parcel more than one can partial delivery
        if (quantity > 1 && !isVerified) {
          let partialDeliveryReason = {
            id: partialDeliveryID,
            description: translationString.partial_delivery,
            reasonAction: Constants.ReasonAction.NO_ADDITIONAL_ACTION, // deafult no photo
            reasonType: Constants.ReasonType.PARTIAL_DELIVERY_EX_REASON,
          };
          tempReasonList = [partialDeliveryReason].concat(tempReasonList);
        }
      }

      tempReasonList.push(otherReasonModel);
      setDatalist(tempReasonList);

      AsyncStorage.getItem(Constants.PENDING_ACTION_LIST).then((res) => {
        if (res) {
          const tempPendingActionList = JSON.parse(res);
          if (tempPendingActionList.length > 0) {
            setPendingActionList(tempPendingActionList);
            const pendingActionModel =
              tempPendingActionList[tempPendingActionList.length - 1];
            setActionModel(pendingActionModel);
          }
        }
      });
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = async () => {
        if (route.name === 'PhotoReason') {
          await updatePhotoSyncStatusByAction();
          navigation.goBack();
        } else {
          if (reasonType === Constants.ReasonType.PRECALL_EX_REASON) {
            return true;
          } else {
            navigation.goBack();
            AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
          }
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [route.name, reasonType]),
  );

  const orderItemQuantity = () => {
    let totalSum = 0;

    const orderList = OrderRealmManager.getOrderByJodId(job.id, epodRealm);

    if (orderList && orderList.length > 0) {
      let count = 1;
      orderList.map((orderModel) => {
        let seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
          orderModel.id,
          epodRealm,
        );

        seletedOrderItems = seletedOrderItems.filter(
          (x) => x.sku && x.expectedQuantity > 0,
        );

        if (count === orderList.length) {
          let selectedContainer = JobRealmManager.getJobContainersByJobId(
            job.id,
            epodRealm,
          );

          if (selectedContainer && selectedContainer.length > 0) {
            seletedOrderItems.push(...selectedContainer);
          }
        } else {
          count++;
        }

        seletedOrderItems.map((item) => {
          const quantity = item.expectedQuantity - item.quantity;
          totalSum += quantity;
        });
      });
    }

    return totalSum;
  };

  return {
    datalist,
    selectedReasonId,
    otherReason,
    otherReasonId,
    partialDeliveryID,
    alertMsg,
    isLoading,
    scanQrResult,
    scanQRReasonId,
    otherReasonOnChangeText,
    itemOnPressed,
    confirmButtonOnPressed,
    gotoCameraScreen,
    scannedQRContentOnChangeText,
  };
};
