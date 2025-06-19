/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import moment from 'moment';
import NotYetUploadIcon from '../../Assets/image/icon_notyetupload.png';
import UploadedIcon from '../../Assets/image/icon_uploaded.png';
import {IndexContext} from '../../Context/IndexContext';
import * as RootNavigation from '../../rootNavigation';
import {useSelector, useDispatch} from 'react-redux';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import * as JobHelper from '../../Helper/JobHelper';
import {createAction} from '../../Actions/CreateActions';
import * as ActionType from '../../Actions/ActionTypes';
import {ActionSyncContext} from '../../Context/ActionSyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as JobBinRealmManager from '../../Database/realmManager/JobBinRealmManager';
import {useLocation} from '../../Hooks/Location/useLocation';

export const useJobItem = (item) => {
  const locationModel = useSelector((state) => state.LocationReducer);
  const {epodRealm, masterData, manifestData} = React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const [jointTableData, setJoinTableData] = useState({
    customerCode: '',
    customerStep: '',
  });
  const noTime = '00:00';
  const [isModalVisible, setModalVisible] = useState(false);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const dispatch = useDispatch();
  const {setGPSTracking} = useLocation();
  const [decryptedConsignee, setDecryptedConsignee] = useState(item.consignee);
  const [isShowDecrypt, setIsShowDecrypt] = useState(false);

  useEffect(() => {
    if (isShowDecrypt) {
      dispatch({type: 'ENABLE_WATERMARK'});
    } else {
      dispatch({type: 'DISABLE_WATERMARK'});
    }
  }, [isShowDecrypt]);

  const gotoDetailScreen = async () => {
    if (item.isLocked) {
      let filterMsgPayload = {
        filterSuccessMsg: translationString.job_transfers.jobLocked,
      };

      dispatch(
        createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload),
      );
    } else {
      const isFoodWasteJ = await isFoodWasteJob();
      JobHelper.gotoDetailScreen(item, undefined, isFoodWasteJ);
    }
  };

  const goToWeightCaptureJobManualEnterScreen = () => {
    RootNavigation.navigate('JobWeightCaptureManualEnter', {
      job: item,
      option: 'normal',
    });
  };

  const contactButtonOnPressed = () => {
    if (item.isLocked) {
      let filterMsgPayload = {
        filterSuccessMsg: translationString.job_transfers.jobLocked,
      };

      dispatch(
        createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload),
      );
    } else {
      AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
      let consigneeName = getConsignee();
      const step = JobHelper.getStepCode(
        item.customer,
        item.currentStepCode,
        item.jobType,
      );

      if (step && step.stepCode) {
        if (step.stepCode === Constants.StepCode.PRE_CALL) {
          RootNavigation.navigate('PreCallAction', {
            job: item,
            consigneeName: consigneeName,
            stepCode: step.stepCode,
          });
        } else {
          RootNavigation.navigate('GeneralCallReason', {
            job: item,
            reasonType: Constants.ReasonType.CALL_REASON,
            actionModel: {
              guid: uuidv4(),
              actionType: Constants.ActionType.GENERAL_CALL_START,
              jobId: item.id,
              operateTime: moment().format(),
              longitude: locationModel.longitude,
              latitude: locationModel.latitude,
            },
            stepCode: step.stepCode,
            consigneeName: consigneeName,
          });
        }
      }
    }
  };

  const moreButtonOnPressed = () => {
    if (item.isLocked) {
      let filterMsgPayload = {
        filterSuccessMsg: translationString.job_transfers.jobLocked,
      };

      dispatch(
        createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload),
      );
    } else {
      navigateJobDetailScreen();
    }
  };

  const trackingNumOnPressed = () => {
    if (item.isLocked) {
      let filterMsgPayload = {
        filterSuccessMsg: translationString.job_transfers.jobLocked,
      };

      dispatch(
        createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload),
      );
    } else {
      navigateJobDetailScreen();
    }
  };

  const navigateJobDetailScreen = () => {
    AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
    let consigneeName = getConsignee();
    let trackNumModel = getTrackingNumberOrCount();
    let requestTime = getPeriod();

    if (item.customer) {
      const step = JobHelper.getStepCode(
        item.customer,
        item.currentStepCode,
        item.jobType,
      );

      RootNavigation.navigate('JobDetail', {
        job: item,
        consigneeName: consigneeName,
        trackNumModel: trackNumModel,
        requestTime: requestTime,
        step: step,
      });
    }
  };

  const getConsignee = () => {
    return JobHelper.getConsignee(item, isShowDecrypt);
  };

  const getConsigneeTitleWithColon = () => {
    let title = '';

    if (item.jobType === Constants.JobType.DELIVERY) {
      title = translationString.receiver;
    }

    if (item.jobType === Constants.JobType.PICK_UP) {
      title = translationString.picker;
    }

    return title;
  };

  const getTrackingNumberOrCount = () => {
    return JobHelper.getTrackingNumberOrCount(item);
  };

  const getDisplayTime = () => {
    let timeSring = '-';
    if (item.jobType === Constants.JobType.DELIVERY) {
      timeSring = `${translationString.formatString(
        translationString.receive_time,
        moment(item.podTime).format('HH:mm'),
      )}`;
    } else if (item.jobType === Constants.JobType.PICK_UP) {
      timeSring = `${translationString.formatString(
        translationString.pickup_time,
        moment(item.podTime).format('HH:mm'),
      )}`;
    }

    return timeSring;
  };

  const getPeriod = () => {
    /*    display date differently
    1. Before 1600 = From null To 1600   (1600前)
    2. After 1600 = From 1600 To null   (1600後)
    3. At 1600 = From 1600 to 1600   (準時1600)
    4. From 00 to 00 (No time)
    5. Between = From 1200 To 1400 (11:00 - 14:00)*/
    return JobHelper.getPeriod(item);
  };

  const getAction = () => {
    if (item.customer) {
      const step = item.customer.customerSteps.find(
        (s) =>
          s.sequence === item.currentStepCode && s.jobType === item.jobType,
      );

      if (step && step.stepCode) {
        switch (step.stepCode) {
          case Constants.StepCode.PRE_CALL:
          case Constants.StepCode.PRE_CALL_COLLECT:
            return translationString.precall;
          case Constants.StepCode.SIMPLE_POD:
            return translationString.pod;
          case Constants.StepCode.COLLECT:
            return translationString.collect_step;
          case Constants.StepCode.ESIGN_POD:
            return translationString.e_sign_pod;
          case Constants.StepCode.BARCODE_POD:
            return translationString.barcode_pod;
          case Constants.StepCode.BARCODEESIGN_POD:
            return translationString.barcode_esign_pod;
          case Constants.StepCode.ESIGNBARCODE_POD:
            return translationString.esign_barcode_pod;
          case Constants.StepCode.VERIFY_QTY:
            return translationString.verifyQuantity;
          case Constants.StepCode.WEIGHT_CAPTURE:
            return translationString.weightCapture;
          case Constants.StepCode.SCAN_QR_POD:
            return translationString.scanQrPod;
          case Constants.StepCode.ESIGN_POC:
            return translationString.e_sign_poc;
          default:
            return '';
        }
      } else {
        return '';
      }
    }
  };

  const getReasonDescription = () => {
    let reasonDescription = '-';
    if (item.reasonDescription) {
      if (item.status === Constants.JobStatus.PARTIAL_DELIVERY) {
        reasonDescription = `${translationString.formatString(
          translationString.pd_reason,
          item.reasonDescription,
        )}`;
      } else if (item.status === Constants.JobStatus.FAILED) {
        reasonDescription = `${translationString.formatString(
          translationString.failed_reason,
          item.reasonDescription,
        )}`;
      }
    }

    return reasonDescription;
  };

  const getSyncText = () => {
    return item.isSynced
      ? translationString.uploaded
      : translationString.pending_upload;
  };

  const getSyncTextColor = () => {
    return item.isSynced ? Constants.Pending_Color : Constants.Dark_Grey;
  };

  const getSyncIcon = () => {
    return item.isSynced ? UploadedIcon : NotYetUploadIcon;
  };

  const getReAttemptName = () => {
    let reattemptString = '';
    if (item.jobType === Constants.JobType.DELIVERY) {
      reattemptString = translationString.resend;
    } else if (item.jobType === Constants.JobType.PICK_UP) {
      reattemptString = translationString.repickup;
    }

    return reattemptString;
  };

  const statusBarColour = (jobStatus) => {
    switch (jobStatus) {
      case Constants.JobStatus.OPEN:
        return Constants.Pending_Color;
      case Constants.JobStatus.IN_PROGRESS:
        return Constants.Shipping_Color;
      case Constants.JobStatus.COMPLETED:
        return Constants.Completed_Color;
      case Constants.JobStatus.FAILED:
        return Constants.Failed_Color;
      case Constants.JobStatus.PARTIAL_DELIVERY:
        return Constants.Partial_Delivery_Color;
      default:
        return 'transparent';
    }
  };

  const gotoCameraScreen = () => {
    if (item.isLocked) {
      let filterMsgPayload = {
        filterSuccessMsg: translationString.job_transfers.jobLocked,
      };

      dispatch(
        createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload),
      );
    } else {
      AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
      if (item.customer) {
        const step = JobHelper.getStepCode(
          item.customer,
          item.currentStepCode,
          item.jobType,
        );

        RootNavigation.navigate('Camera', {
          job: item,
          stepCode: step && step.stepCode ? step.stepCode : '',
        });
      }
    }
  };

  const redoJob = async () => {
    let actionType =
      item.jobType === Constants.JobType.PICK_UP
        ? Constants.ActionType.RECOLLECT
        : Constants.ActionType.RESEND;

    let actionModel = {
      guid: uuidv4(),
      actionType: actionType,
      jobId: item.id,
      operateTime: moment().format(),
      longitude: locationModel.longitude,
      latitude: locationModel.latitude,
      syncPhoto: Constants.SyncStatus.SYNC_SUCCESS,
      syncItem: Constants.SyncStatus.SYNC_SUCCESS,
    };

    // Turn GPS tracking back on for redelivery attempts
    console.log('Call from redoJob');
    setGPSTracking(true);

    await JobHelper.redo(item.id, actionModel, epodRealm);
    actionSyncAndRefreshJobList();
    setModalVisible(false);
  };

  const showHideDialog = (visible) => {
    setModalVisible(visible);
  };

  const getReAttemptMessage = () => {
    let reattemptString = '';
    if (item.jobType === Constants.JobType.DELIVERY) {
      reattemptString = translationString.resend_confirm;
    } else if (item.jobType === Constants.JobType.PICK_UP) {
      reattemptString = translationString.repickup_confirm;
    }

    return reattemptString;
  };

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
  };

  const isFoodWasteJob = async () => {
    const isJobHaveBin = await JobBinRealmManager.isJobHaveBin(
      epodRealm,
      item.id,
    );
    return isJobHaveBin;
  };

  const isWeightCaptureStep = () => {
    if (!item.customer) {
      return false;
    }

    const step = JobHelper.getStepCode(
      item.customer,
      item.currentStepCode,
      item.jobType,
    );

    if (step) {
      return [Constants.StepCode.WEIGHT_CAPTURE].includes(step.stepCode);
    } else {
      return false;
    }
  };

  const getJobBinQuantity = () => {
    const binLength = JobBinRealmManager.getJobBinByJob(
      epodRealm,
      item.id,
    ).filter((bin) => !bin.isReject).length;
    return (item.status === 0 || item.status === 1) &&
      item.jobType === Constants.JobType.DELIVERY
      ? 0
      : binLength;
  };

  const navigateToViewJobBinFailSummary = () => {
    RootNavigation.navigate('FailureSummaryScreen', {
      job: item,
      option: 'fail',
      mode: 'view',
    });
  };

  const getDecryptData = () => {
    console.log('getDecryptData', item.decryptedConsignee);
    console.log('NogetDecryptData', item.consignee);
    setDecryptedConsignee(
      !isShowDecrypt && item.decryptedConsignee?.length > 0
        ? item.decryptedConsignee
        : item.consignee,
    );

    setIsShowDecrypt((prevState) => !prevState);
  };

  return {
    getDisplayTime,
    statusBarColour,
    getReasonDescription,
    getConsignee,
    getConsigneeTitleWithColon,
    getSyncText,
    getSyncTextColor,
    getSyncIcon,
    getReAttemptName,
    getAction,
    getPeriod,
    getTrackingNumberOrCount,
    gotoDetailScreen,
    moreButtonOnPressed,
    gotoCameraScreen,
    contactButtonOnPressed,
    isModalVisible,
    redoJob,
    getReAttemptMessage,
    showHideDialog,
    trackingNumOnPressed,
    manifestData,
    goToWeightCaptureJobManualEnterScreen,
    isFoodWasteJob,
    isWeightCaptureStep,
    navigateToViewJobBinFailSummary,
    getJobBinQuantity,
    getDecryptData,
    isShowDecrypt,
    decryptedConsignee,
  };
};
