/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image, Alert, Text} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import moment from 'moment';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import * as Constants from '../../../../CommonConfig/Constants';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import {getAllOrderItems} from '../../../../Helper/OrderHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as JobBinRealmManager from '../../../../Database/realmManager/JobBinRealmManager';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import * as RootNavigation from '../../../../rootNavigation';
import {addEventLog} from '../../../../Helper/AnalyticHelper';
import {useFocusEffect} from '@react-navigation/native';
import {PODHelper} from '../../../../Helper/PODHelper';
import CameraIcon from '../../../../Assets/image/icon_camera.png';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';

export const usePocAction = (route, navigation) => {
  const job = route.params.job;
  const consigneeName = route.params.consigneeName;
  const trackNumModel = route.params.trackNumModel;
  const isVerified = route.params.isVerified;
  const stepCode = route.params.stepCode;
  const networkModel = useSelector((state) => state.NetworkReducer);
  const locationModel = useSelector((state) => state.LocationReducer);
  const {auth, manifestData, masterData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const [batchJob, setBatchJob] = useState([]);
  const [isAllowBatchAction, setIsAllowBatchAction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFoodWasteJob, setIsFoodWasteJob] = useState(false);
  let batchSelectJob = route.params.batchJob;

  const {batchJobActionMapper} = PODHelper();

  const dispatch = useDispatch();
  let filterTimeout;

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

  const completeButtonOnPressed = async () => {
    let isSuccess = true;
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );
    let action = ActionHelper.generateActionModel(
      job.id,
      stepCode,
      isSuccess,
      locationModel,
      null,
      step.stepNeedPhoto,
    );

    if (step.stepNeedReason) {
      navigation.navigate('PocReason', {
        job: job,
        reasonType: Constants.ReasonType.POC_REASON,
        actionModel: action,
        stepCode: stepCode,
        onPocReasonComplete: completePocAction,
      });
    } else {
      completePocAction('');
    }
  };

  const completePocAction = async (pocReason) => {
    setIsLoading(true);
    let isSuccess = true;

    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );
    let action = ActionHelper.generateActionModel(
      job.id,
      stepCode,
      isSuccess,
      locationModel,
      null,
      step.stepNeedPhoto,
    );

    action.reasonDescription = pocReason;

    // let actions = [];

    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );

    let selectedJob = getFilteredBatchJob();
    let codAmount = 0;

    if (selectedJob && selectedJob.length > 0) {
      selectedJob.map((x) => {
        codAmount += x.codAmount;
      });
    } else {
      codAmount = job.codAmount;
    }

    if (step.stepNeedPhoto) {
      RootNavigation.navigate('PhotoFlowCamera', {
        job: job,
        stepCode: stepCode,
        actionModel: action,
        photoTaking: step.stepNeedPhoto,
        needScanSku: step.stepNeedScanSku,
        batchJob: selectedJob,
      });
    } else if (step.stepNeedScanSku) {
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
          actionModel: action,
          photoTaking: step.stepNeedPhoto,
          stepCode: stepCode,
          orderList: orderList,
        });
      } else {
        const payload = {
          orderItems: [],
        };
        dispatch(createAction(ActionType.UPDATE_SKU_ORDER_ITEMS, payload));
        navigation.navigate('ScanSku', {
          job: job,
          actionModel: action,
          photoTaking: step.stepNeedPhoto,
          stepCode: stepCode,
          orderList: orderList,
        });
      }
    } else if (codAmount > 0) {
      navigation.navigate('CodAction', {
        job: job,
        stepCode: stepCode,
        actionModel: action,
        orderList: orderList,
        batchJob: selectedJob,
      });
    } else if (stepCode === Constants.StepCode.ESIGN_POC) {
      navigation.navigate('Esign', {
        job: job,
        action: action,
        stepCode: stepCode,
      });
    }
    // SIMPLE POC
    else {
      let selectedJob = batchSelectJob?.filter((x) => x.isSelected === true);
      let selectedJobCheck = selectedJob?.filter((x) => x.id !== job.id);

      if (selectedJobCheck && selectedJobCheck.length > 0) {
        await batchJobActionMapper(
          job.id,
          action,
          stepCode,
          selectedJob,
          false,
        );
        actionSyncAndBackToHomeScreen();
      } else {
        if (orderList && orderList.length > 0) {
          action.orderId = orderList[0].id;
        }

        addEventLog('simple_poc', {
          pocData: `${JSON.stringify(
            action,
          )}; orderCount: ${orderList.length.toString()}`,
        });

        addNewAction(action);
        const isJobUpdated = updateJobInLocalDb(
          job,
          stepCode,
          action,
          isSuccess,
        );
        if (isJobUpdated) {
          actionSyncAndBackToHomeScreen();
        }
      }
    }
    setIsLoading(false);
  };

  const failedButtonOnPressed = async () => {
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    let isSuccess = false;
    let selectedJob = getFilteredBatchJob();

    let action = ActionHelper.generateActionModel(
      job.id,
      stepCode,
      isSuccess,
      locationModel,
    );

    navigation.navigate('SelectReason', {
      job: job,
      reasonType: Constants.ReasonType.POC_EX,
      actionModel: action,
      stepCode: stepCode,
      needScanSku: step.stepNeedScanSku,
      batchJob: selectedJob,
      isVerified: isVerified,
    });
  };

  const actionSyncAndBackToHomeScreen = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }
    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    navigation.popToTop();
  };

  const getFilteredBatchJob = () => {
    let selectedJob = batchSelectJob?.filter((x) => x.isSelected === true);
    let selectedJobCheck = selectedJob?.filter((x) => x.id !== job.id);

    if (selectedJobCheck && selectedJobCheck.length > 0) {
      selectedJob = selectedJob?.sort((a, b) => a.customerId - b.customerId);
    } else {
      selectedJob = null;
    }
    return selectedJob;
  };

  const previewBatchSelectedJob = () => {
    if (!batchSelectJob) {
      batchSelectJob = batchJob;
    }
    navigation.navigate('BatchSelection', {
      job: job,
      batchJob: batchSelectJob,
      consigneeName: consigneeName,
      stepCode: stepCode,
      photoTaking: false,
      actionModel: null,
    });
  };

  const getBatchSelectedJobCount = () => {
    const count = batchSelectJob?.filter((x) => x.isSelected)?.length;
    return count ? count : 1;
  };

  const getBatchJobList = () => {
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    setIsAllowBatchAction(false);
    setBatchJob([]);
    if (
      (stepCode === Constants.StepCode.SIMPLE_POD ||
        stepCode === Constants.StepCode.BARCODE_POD) &&
      !step.stepNeedScanSku &&
      !step.stepNeedVerifyItem &&
      job.isAllowBatchAction
    ) {
      if (!batchSelectJob) {
        const matchedJob = JobHelper.getJobWithCustomFilter(
          job,
          stepCode,
          epodRealm,
        );

        if (matchedJob && matchedJob.length > 1) {
          setIsAllowBatchAction(true);
          setBatchJob(matchedJob);
        }
      } else if (batchSelectJob) {
        setIsAllowBatchAction(true);
        setBatchJob(batchSelectJob);
      }
    }
  };

  const generalTakePhoto = () => {
    let selectedJob = getFilteredBatchJob();
    navigation.navigate('Camera', {
      job: job,
      stepCode: stepCode ? stepCode : '',
      from: 'PocAction',
      batchJob: selectedJob,
    });
  };

  const checkJobHaveBin = async () => {
    const isJobHaveBin = await JobBinRealmManager.isJobHaveBin(
      epodRealm,
      job.id,
    );

    return isJobHaveBin;
  };

  const getJobBinInfo = () => {
    const jobBins = JobBinRealmManager.getJobBinByJob(epodRealm, job.id);
    return jobBins;
  };

  const completeJobBinDelivery = async (isPartialDelivery) => {
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    const tempOrderList = [];
    const tempOrderItemList = [];
    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );

    if (orderList && orderList.length > 0) {
      orderList.map((orderModel) => {
        const tempOrderModel =
          GeneralHelper.convertRealmObjectToJSON(orderModel);
        tempOrderList.push(tempOrderModel);

        const seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
          orderModel.id,
          epodRealm,
        );

        seletedOrderItems.map((item, index) => {
          let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
          orderItemModel.key = index;
          tempOrderItemList.push(orderItemModel);
        });
      });
    }

    const deliveryType = isPartialDelivery ? 0 : 1;
    const action = ActionHelper.generateActionModel(
      job.id,
      step.stepCode,
      deliveryType,
      locationModel,
    );

    if (isPartialDelivery) {
      await ActionHelper.insertPartialDeliveryActionAndOrderItem(
        job,
        action,
        orderList,
        tempOrderItemList,
        epodRealm,
      );
    } else {
      await ActionHelper.insertSuccessDeliveryActionForJobBin(
        job,
        action,
        orderList,
        tempOrderItemList,
        epodRealm,
      );
    }

    navigation.popToTop();
  };

  useEffect(() => {
    getBatchJobList();
  }, [batchSelectJob]);

  useFocusEffect(
    React.useCallback(() => {
      getBatchJobList();
    }, []),
  );

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
      headerRight: () => {
        if (isAllowBatchAction) {
          return (
            <TouchableOpacity
              style={Constants.navStyles.navButton}
              onPress={generalTakePhoto}>
              <Image source={CameraIcon} resizeMode={'stretch'} />
            </TouchableOpacity>
          );
        } else {
          return null;
        }
      },
      headerTitle: translationString.poc,
      headerStyle: {
        backgroundColor: Constants.Dark_Grey,
      },
    });
  }, [navigation, isAllowBatchAction, batchSelectJob]);

  return {
    job,
    consigneeName,
    trackNumModel,
    isAllowBatchAction,
    isLoading,
    isFoodWasteJob,
    completeButtonOnPressed,
    failedButtonOnPressed,
    getBatchSelectedJobCount,
    previewBatchSelectedJob,
    checkJobHaveBin,
    getJobBinInfo,
    setIsFoodWasteJob,
    completeJobBinDelivery,
  };
};
