/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import * as Constants from '../../../../CommonConfig/Constants';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import CallDetectorManager from 'react-native-call-detection';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import {PODHelper} from '../../../../Helper/PODHelper';

export const usePreCallAction = (route, navigation) => {
  const job = route.params.job;
  const consigneeName = route.params.consigneeName;
  const stepCode = route.params.stepCode;
  // use to define photo taking flow else it is normal flow
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;
  let batchSelectJob = route.params.batchJob;

  const [actionModel, setActionModel] = useState(route.params?.actionModel);

  const locationModel = useSelector((state) => state.LocationReducer);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const [isShowEditModal, setIsShowEditModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [phoneNum, setPhoneNum] = useState(job.contact);
  //hold previous phone number for cancel
  const [pendingActionList, setPendingActionList] = useState([]);
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  //use to indicator is from call or edit phone number (request to edit/confirm phone number before call )
  const [isCallOnPress, setCallOnPress] = useState(false);
  const [isAllowBatchAction, setIsAllowBatchAction] = useState(false);
  const [batchJob, setBatchJob] = useState([]);
  const [isShowDecrypt, setIsShowDecrypt] = useState(false);
  const [decryptedConsignee, setDecryptedConsignee] = useState(consigneeName);
  const [decryptedContact, setDecryptedContact] = useState(phoneNum);
  const [modalContactNumber, setModalContactNumber] = useState('');

  const dispatch = useDispatch();
  const {batchJobActionMapper} = PODHelper();

  let filterTimeout;

  useEffect(() => {
    if (isShowDecrypt) {
      dispatch({type: 'ENABLE_WATERMARK'});
    } else {
      dispatch({type: 'DISABLE_WATERMARK'});
    }
  }, [isShowDecrypt]);

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
  };

  const getCallLogJson = () => {
    const callStartTime = moment(startTime);
    const callEndtime = moment(endTime);
    let duration = moment.duration(callEndtime.diff(callStartTime)).asSeconds();
    let callLogJSON = {
      endCallDate: endTime,
      phoneNo: phoneNum,
      startCallDate: startTime,
      duration: duration,
    };

    return JSON.stringify(callLogJSON);
  };

  const addNewAction = async (actionModel) => {
    try {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        ActionRealmManager.insertNewAction(actionModel, epodRealm);
      });
    } catch (error) {
      alert('Add Action Error: ' + error);
    }
  };

  const addNewActionWithoutTimeout = async (actionModel) => {
    try {
      ActionRealmManager.insertNewAction(actionModel, epodRealm);
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

  const saveToLocalDb = async (isSuccess, jobModel, orderList) => {
    let actions = [];
    let action = actionModel
      ? actionModel
      : ActionHelper.generateCallActionModel(
          jobModel,
          stepCode,
          isSuccess,
          locationModel,
        );

    const additionalParamJson = getCallLogJson();
    let selectedJob = batchJob?.filter((x) => x.isSelected === true);
    let selectedJobCheck = selectedJob?.filter((x) => x.id !== job.id);
    let isJobUpdated = true;

    if (selectedJobCheck && selectedJobCheck.length > 0) {
      await batchJobActionMapper(
        job.id,
        action,
        stepCode,
        selectedJob,
        photoTaking,
        false,
        null,
        additionalParamJson,
        phoneNum,
      );
    } else {
      if (job.contact !== phoneNum) {
        action.remark = `phone number: ${job.decryptedContact}`;
      }

      let _jobModel = job;
      _jobModel.additionalParamJson = additionalParamJson;

      if (orderList && orderList.length > 0) {
        action.orderId = orderList[0].id;
      }

      await addNewAction(action);
      isJobUpdated = await updateJobInLocalDb(
        _jobModel,
        stepCode,
        action,
        isSuccess,
      );

      if (photoTaking) {
        // update photo status for action with photo flow for pending upload
        await PhotoHelper.updatePhotoSyncStatusByAction(action, epodRealm);
      }
    }

    if (isJobUpdated) {
      actionSyncAndRefreshJobList();
    }
  };

  const saveGeneralCallActionToLocalDb = async (
    isSuccess,
    jobModel,
    orderList,
  ) => {
    let tempPendingActionList = pendingActionList;
    let generalCallActionModel = ActionHelper.generateCallActionModel(
      jobModel,
      stepCode,
      isSuccess,
      locationModel,
    );
    if (job.contact !== phoneNum) {
      generalCallActionModel.remark = `phone number: ${phoneNum}`;
    }
    tempPendingActionList.push(generalCallActionModel);
    setPendingActionList(tempPendingActionList);

    AsyncStorage.setItem(
      Constants.PENDING_ACTION_LIST,
      JSON.stringify(tempPendingActionList),
    );

    tempPendingActionList.map(async (pendingActionModel) => {
      if (orderList && orderList.length > 0) {
        pendingActionModel.orderId = orderList[0].id;
      }
      await addNewAction(pendingActionModel);
    });

    await JobHelper.updateJobForGeneralCall(jobModel, epodRealm);
    actionSyncAndRefreshJobList();
  };

  //Button On Pressed
  const callButtonOnPressed = () => {
    setModalContactNumber(job.decryptedContact);
    setCallOnPress(true);
    setIsShowEditModal(true);
  };

  const completeButtonOnPressed = async () => {
    const isSuccess = true;
    let jobModel = job;
    jobModel.additionalParamJson = getCallLogJson();
    const orderList = await OrderRealmManager.getOrderByJodId(
      jobModel.id,
      epodRealm,
    );

    if (
      actionModel &&
      actionModel.actionType != Constants.ActionType.PRE_CALL_SUCCESS
    ) {
      //General Call
      saveGeneralCallActionToLocalDb(isSuccess, jobModel, orderList);
    } else {
      //Pre Call
      saveToLocalDb(isSuccess, jobModel, orderList);
    }
  };

  const failedButtonOnPressed = () => {
    const isSuccess = false;
    let jobModel = job;
    if (startTime.length > 0 && endTime.length > 0) {
      jobModel.additionalParamJson = getCallLogJson();
    }

    let action = ActionHelper.generateCallActionModel(
      jobModel,
      stepCode,
      isSuccess,
      locationModel,
    );

    if (actionModel && photoTaking) {
      action.guid = actionModel.guid;
    }

    if (job.contact !== phoneNum) {
      action.remark = `phone number: ${phoneNum}`;
    }

    let tempPendingActionList = pendingActionList;
    tempPendingActionList.push(action);
    setPendingActionList(tempPendingActionList);
    AsyncStorage.setItem(
      Constants.PENDING_ACTION_LIST,
      JSON.stringify(tempPendingActionList),
    );

    let selectedJob = getFilteredBatchJob();

    navigation.navigate('SelectReason', {
      reasonType: Constants.ReasonType.PRECALL_EX_REASON,
      job: job,
      actionModel: action,
      stepCode: stepCode,
      photoTaking: photoTaking,
      batchJob: selectedJob,
    });
  };

  const editButtonOnPressed = () => {
    setModalContactNumber(job.decryptedContact);
    setCallOnPress(false);
    setIsShowEditModal(true);
  };

  const cancelEditContactNumberModal = () => {
    dismissEditContactNumberModal();
  };

  const confirmEditContactNumberModal = () => {
    job.decryptedContact = modalContactNumber;
    job.contact = maskPhoneNumber(modalContactNumber);
    setPhoneNum(job.contact);

    if (isCallOnPress) {
      GeneralHelper.makePhoneCall(job.decryptedContact);
    }

    dismissEditContactNumberModal();
  };

  const dismissEditContactNumberModal = () => {
    setIsShowEditModal(false);
  };

  const skipPreCall = () => {
    let action = ActionHelper.generateSkipAction(job, locationModel);

    if (actionModel && photoTaking) {
      action.guid = actionModel.guid;
    }

    let selectedJob = getFilteredBatchJob();

    navigation.navigate('SelectReason', {
      reasonType: Constants.ReasonType.PRECALL_SKIP_REASON,
      job: job,
      stepCode: stepCode,
      actionModel: action,
      photoTaking: photoTaking,
      batchJob: selectedJob,
    });
  };

  const maskPhoneNumber = (input) => {
    if (!input || input.trim() === '' || input.length <= 4) {
      return input;
    }
    const maskedPhoneNumber = '*'.repeat(input.length - 4) + input.slice(-4);
    return maskedPhoneNumber;
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
      photoTaking: photoTaking,
      actionModel: actionModel,
    });
  };

  const getBatchSelectedJobCount = () => {
    const count = batchSelectJob?.filter((x) => x.isSelected)?.length;
    return count ? count : 1;
  };

  const getFilteredBatchJob = () => {
    let selectedJob = batchJob?.filter((x) => x.isSelected === true);
    let selectedJobCheck = selectedJob?.filter((x) => x.id !== job.id);

    if (selectedJobCheck && selectedJobCheck.length > 0) {
      selectedJob = selectedJob?.sort((a, b) => a.customerId - b.customerId);
    } else {
      selectedJob = null;
    }
    return selectedJob;
  };

  useEffect(() => {
    AsyncStorage.getItem(Constants.PENDING_ACTION_LIST).then((res) => {
      if (res) {
        const tempPendingActionList = JSON.parse(res);
        if (tempPendingActionList.length > 0) {
          setPendingActionList(tempPendingActionList);
        }
      }
    });
  }, []);

  useEffect(() => {
    setBatchJob(route.params.batchJob);
  }, [route.params.batchJob]);

  //Call Detector
  useEffect(() => {
    const callDetector = new CallDetectorManager(
      (event, number) => {
        // setPhoneNum(number);
        // For iOS event will be either "Connected",
        // "Disconnected","Dialing" and "Incoming"

        // For Android event will be either "Offhook",
        // "Disconnected", "Incoming" or "Missed"
        // phoneNumber should store caller/called number

        if (event === 'Disconnected') {
          // Do something call got disconnected
          setEndTime(moment().format());
        } else if (
          event === 'Connected' ||
          event === 'Dialing' ||
          event === 'Offhook'
        ) {
          setStartTime(moment().format());
        }
      },
      true, // To detect incoming calls [ANDROID]
      () => {
        // If your permission got denied [ANDROID]
        // Only if you want to read incoming number
        // Default: console.error
      },
      {
        title: 'Phone State Permission',
        message: translationString.precall_permission,
      },
    );

    return () => callDetector.dispose();
  }, []);

  useEffect(() => {
    if (!job.isAllowBatchAction) {
      setIsAllowBatchAction(false);
      setBatchJob([]);
      return;
    }

    if (!batchSelectJob && !stepCode.stepNeedScanSku) {
      const matchedJob = JobHelper.getJobWithCustomFilter(
        job,
        Constants.StepCode.PRE_CALL,
        epodRealm,
      );
      if (matchedJob && matchedJob.length > 1) {
        setIsAllowBatchAction(true);
        setBatchJob(matchedJob);
        // navigation.navigate('BatchSelection', {
        //   job: job,
        //   batchJob: matchedJob,
        //   stepCode: stepCode,
        // });
      }
    }
  }, [phoneNum]);

  const getDecryptData = async () => {
    setDecryptedConsignee(
      !isShowDecrypt && job.decryptedConsignee?.length > 0
        ? job.decryptedConsignee
        : consigneeName,
    );
    setDecryptedContact(
      !isShowDecrypt && job.decryptedContact?.length > 0
        ? job.decryptedContact
        : phoneNum,
    );

    setIsShowDecrypt((prevState) => !prevState);
  };

  return {
    job,
    consigneeName,
    stepCode,
    startTime,
    endTime,
    locationModel,
    isShowEditModal,
    phoneNum,
    photoTaking,
    actionModel,
    isAllowBatchAction,
    batchJob,
    callButtonOnPressed,
    completeButtonOnPressed,
    failedButtonOnPressed,
    editButtonOnPressed,
    cancelEditContactNumberModal,
    confirmEditContactNumberModal,
    getBatchSelectedJobCount,
    previewBatchSelectedJob,
    skipPreCall,
    isShowDecrypt,
    decryptedConsignee,
    decryptedContact,
    getDecryptData,
    modalContactNumber,
    setModalContactNumber,
  };
};
