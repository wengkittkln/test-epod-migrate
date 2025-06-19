import * as Constants from '../CommonConfig/Constants';
import * as JobRealmManager from '../Database/realmManager/JobRealmManager';
import * as CustomerStepRealmManager from '../Database/realmManager/CustomerStepRealmManager';
import * as OrderRealmManager from '../Database/realmManager/OrderRealmManager';
import * as GeneralHelper from './GeneralHelper';
import * as ActionHelper from './ActionHelper';
import moment from 'moment';
import {translationString} from '../Assets/translation/Translation';
import * as RootNavigation from '../rootNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiController from '../ApiController/ApiController';

export const getStepCode = (customerModel, currentStepCode, jobType) => {
  const step = customerModel.customerSteps.find(
    (s) => s.sequence === currentStepCode && s.jobType === jobType,
  );

  return step;
};

export const getStepCodeByJobId = (customerModel, jobId, jobType, realm) => {
  let job = JobRealmManager.getJobByJobId(jobId, realm);
  job = GeneralHelper.convertRealmObjectToJSON(job);

  const step = customerModel.customerSteps.find(
    (s) => s.sequence === job.currentStepCode && s.jobType === jobType,
  );

  return step;
};

export const statusBarColour = (jobStatus) => {
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

export const getCallActionType = (stepCode, isSuccess) => {
  if (
    stepCode === Constants.StepCode.PRE_CALL ||
    stepCode === Constants.StepCode.PRE_CALL_COLLECT
  ) {
    return isSuccess
      ? Constants.ActionType.PRE_CALL_SUCCESS
      : Constants.ActionType.PRE_CALL_FAIL;
  } else {
    return isSuccess
      ? Constants.ActionType.GENERAL_CALL_SUCCESS
      : Constants.ActionType.GENERAL_CALL_FAIL;
  }
};

export const getActionType = (stepCode, isSuccess) => {
  switch (stepCode) {
    case Constants.StepCode.SIMPLE_POD:
    case Constants.StepCode.SCAN_QR_POD:
      return isSuccess
        ? Constants.ActionType.POD_SUCCESS
        : Constants.ActionType.POD_FAIL;
    case Constants.StepCode.COLLECT:
    case Constants.StepCode.WEIGHT_CAPTURE:
      return isSuccess
        ? Constants.ActionType.COLLECT_SUCCESS
        : Constants.ActionType.COLLECT_FAIL;
    case Constants.StepCode.ESIGN_POD:
      return isSuccess
        ? Constants.ActionType.ESIGNATURE_POD
        : Constants.ActionType.POD_FAIL;

    case Constants.StepCode.BARCODE_POD:
      return isSuccess
        ? Constants.ActionType.BARCODE_POD
        : Constants.ActionType.POD_FAIL;
    case Constants.StepCode.BARCODEESIGN_POD:
      return isSuccess
        ? Constants.ActionType.BARCODEESIGN_POD
        : Constants.ActionType.POD_FAIL;
    case Constants.StepCode.ESIGNBARCODE_POD:
      return isSuccess
        ? Constants.ActionType.ESIGNBARCODE_POD
        : Constants.ActionType.POD_FAIL;
    case Constants.StepCode.ESIGN_POC:
      return isSuccess
        ? Constants.ActionType.ESIGNATURE_POC
        : Constants.ActionType.POC_FAIL;
    default:
      return 0;
  }
};

export const sortingForAllJobAndSearchJob = (joblist) => {
  let sortedList = [];
  let jobListOne = joblist.filter(function (item) {
    return item.status <= Constants.JobStatus.IN_PROGRESS;
  });
  jobListOne.sort((a, b) => a.sequence - b.sequence); //ascending

  let jobListTwo = joblist.filter(function (item) {
    return item.status > Constants.JobStatus.IN_PROGRESS;
  });
  jobListTwo.sort((a, b) => new Date(b.podTime) - new Date(a.podTime)); //descending

  sortedList = jobListOne.concat(jobListTwo);

  return sortedList;
};

export const updateProgressByStep = (maxStep, jobModel) => {
  if (jobModel.currentStepCode > maxStep) {
    jobModel.status = Constants.JobStatus.COMPLETED;
    jobModel.pendingStatus = Constants.JobStatus.COMPLETED;
  } else if (jobModel.currentStepCode > 1) {
    //It means not the  first step
    jobModel.status = Constants.JobStatus.IN_PROGRESS;
    jobModel.pendingStatus = Constants.JobStatus.IN_PROGRESS;
  }
};

export const updateJob = (job, stepCode, actionModel, isSuccess, realm) => {
  const selectedJob = JobRealmManager.getJobByJobId(job.id, realm);

  if (selectedJob) {
    let selectedJobModel = GeneralHelper.convertRealmObjectToJSON(selectedJob);

    if (ActionHelper.isPartialDelivery(actionModel.actionType, stepCode)) {
      generateStatus(
        actionModel.reasonDescription,
        0,
        Constants.JobStatus.PARTIAL_DELIVERY,
        selectedJobModel,
      );
      JobRealmManager.updateJobData(selectedJobModel, realm);
    } else if (ActionHelper.isException(actionModel.actionType, stepCode)) {
      generateStatus(
        actionModel.reasonDescription,
        0,
        Constants.JobStatus.FAILED,
        selectedJobModel,
      );
      JobRealmManager.updateJobData(selectedJobModel, realm);
    } else if (
      ActionHelper.isPreCallSkipOrFailed(actionModel.actionType, stepCode)
    ) {
      selectedJobModel.currentStep = selectedJobModel.currentStepCode;
      selectedJobModel.currentStepCode = selectedJobModel.currentStepCode + 1;
      selectedJobModel.isSynced = false;

      const customerSteplist =
        CustomerStepRealmManager.getStepCodeByCustomerIdAndJobType(
          selectedJobModel.customerId,
          job.jobType,
          realm,
        );

      updateProgressByStep(customerSteplist.length, selectedJobModel);
      JobRealmManager.updateJobData(selectedJobModel, realm);
    } else if (
      !(
        actionModel.actionType === Constants.ActionType.GENERAL_CALL_SUCCESS ||
        actionModel.actionType === Constants.ActionType.GENERAL_CALL_FAIL
      )
    ) {
      let customerStepCodeList =
        CustomerStepRealmManager.getStepCodeByCustomerIdAndJobType(
          job.customerId,
          job.jobType,
          realm,
        );
      selectedJobModel.latestActionId = actionModel.guid;
      selectedJobModel.podTime = actionModel.operateTime;
      selectedJobModel.isSynced = false;
      //Only complete update the currentStepCode else fill in reason only update
      // skip pre-call also will pass false to success
      // the step count will increase when skip pre-call reason is provided
      if (isSuccess && ActionHelper.isValid(stepCode, actionModel.actionType)) {
        selectedJobModel.currentStep = selectedJobModel.currentStepCode;
        selectedJobModel.currentStepCode = selectedJobModel.currentStepCode + 1;
      }
      updateProgressByStep(customerStepCodeList.length, selectedJobModel);
      JobRealmManager.updateJobData(selectedJobModel, realm);
    }
  }
};

export const generateStatus = (
  reasonDescription,
  stepCode,
  status,
  jobModel,
) => {
  jobModel.reasonDescription = reasonDescription;
  jobModel.currentStep = jobModel.currentStepCode;
  jobModel.status = status;
  jobModel.isSynced = false;
  jobModel.podTime = moment().format();
};

export const updateJobForGeneralCall = (job, realm) => {
  let selectedJob = JobRealmManager.getSelectedJob(realm, job.id);

  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);
    selectedJob.isSynced = false;
    JobRealmManager.updateJobData(selectedJob, realm);
  }
};

export const updateJobWithExceptionReason = async (
  jobId,
  actionModel,
  stepCode,
  realm,
) => {
  let selectedJob = JobRealmManager.getSelectedJob(realm, jobId);

  if (selectedJob && selectedJob.length > 0) {
    selectedJob = selectedJob[0];
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob);

    if (ActionHelper.isPartialDelivery(actionModel.actionType, stepCode)) {
      generateStatus(
        actionModel.reasonDescription,
        0,
        Constants.JobStatus.PARTIAL_DELIVERY,
        selectedJob,
      );
      await JobRealmManager.updateJobData(selectedJob, realm);
    } else if (ActionHelper.isException(actionModel.actionType, stepCode)) {
      generateStatus(
        actionModel.reasonDescription,
        0,
        Constants.JobStatus.FAILED,
        selectedJob,
      );
      await JobRealmManager.updateJobData(selectedJob, realm);
    } else if (
      ActionHelper.isPreCallSkipOrFailed(actionModel.actionType, stepCode)
    ) {
      selectedJob.currentStep = selectedJob.currentStepCode;
      selectedJob.currentStepCode = selectedJob.currentStepCode + 1;
      selectedJob.isSynced = false;

      const customerSteplist =
        CustomerStepRealmManager.getStepCodeByCustomerIdAndJobType(
          selectedJob.customerId,
          Constants.JobType.DELIVERY,
          realm,
        );

      updateProgressByStep(customerSteplist.length, selectedJob);
      await JobRealmManager.updateJobData(selectedJob, realm);
    } else {
      if (selectedJob.status !== null && selectedJob.status !== 0) {
        selectedJob.isSynced = false;
      }
    }
  }
};

export const redo = async (jobId, actionModel, realm) => {
  let selectedJob = JobRealmManager.getSelectedJob(realm, jobId);

  if (selectedJob) {
    let selectedJobModel = GeneralHelper.convertRealmObjectToJSON(
      selectedJob[0],
    );
    selectedJobModel.reasonDescription = '';
    selectedJobModel.currentStep = 0;
    selectedJobModel.currentStepCode = 1;
    selectedJobModel.status = Constants.JobStatus.OPEN;
    selectedJobModel.pendingStatus = Constants.JobStatus.OPEN;
    selectedJobModel.isSynced = true;
    selectedJobModel.podTime = null;
    selectedJobModel.latestActionId = null;

    let orderList = OrderRealmManager.getOrderByJodId(jobId, realm);

    if (orderList && orderList.length > 0) {
      actionModel.orderId = orderList[0].id;
    }

    await ActionHelper.insertAction(actionModel, realm);
    await JobRealmManager.updateJobData(selectedJobModel, realm);
  }
};

export const isCOD = (jobModel) => {
  return jobModel.codAmount !== null && jobModel.codAmount > 0;
};

// ------------  Job Detail ------------
export const getConsignee = (item, isShowDecrypt) => {
  let nameValue = translationString.unknown;

  if (item.consignee) {
    nameValue = isShowDecrypt ? item.decryptedConsignee : item.consignee;
  }

  if (item.customer && item.customer.customerCode) {
    nameValue = nameValue + `(${item.customer.customerCode})`;
  }

  return nameValue;
};

export const getTrackingNumberOrCount = (item) => {
  let trackingNum = '';
  let isUnderline = false;
  if (!item.trackingList || item.trackingList === '') {
    trackingNum = '-';
  } else {
    let list = item.trackingList.split(',');

    if (list.length === 1) {
      trackingNum = list[0];
    } else {
      isUnderline = true;
      trackingNum = translationString.formatString(
        translationString.do_num,
        list.length,
      );
    }
  }

  return {
    isUnderline: isUnderline,
    trackingNum: trackingNum,
  };
};

const getArrivesTimeFrom = (item) => {
  return item.requestArrivalTimeFrom
    ? moment(item.requestArrivalTimeFrom).format('HH:mm')
    : '';
};

const getArrivesTimeTo = (item) => {
  return item.requestArrivalTimeTo
    ? moment(item.requestArrivalTimeTo).format('HH:mm')
    : '';
};

export const getPeriod = (item) => {
  const noTime = '00:00';
  /*    display date differently
  1. Before 1600 = From null To 1600   (1600前)
  2. After 1600 = From 1600 To null   (1600後)
  3. At 1600 = From 1600 to 1600   (準時1600)
  4. From 00 to 00 (No time)
  5. Between = From 1200 To 1400 (11:00 - 14:00)*/

  let arrivesFrom = item.requestArrivalTimeFrom;
  let arrivesTo = item.requestArrivalTimeTo;
  let period = translationString.time_on_limit;

  if (!arrivesFrom && !arrivesTo) {
    return period;
  } else if (
    arrivesFrom &&
    arrivesTo &&
    getArrivesTimeFrom(item) === noTime &&
    getArrivesTimeTo(item) === noTime
  ) {
    return period;
  } else if (
    (!arrivesFrom || getArrivesTimeFrom(item) === noTime) &&
    arrivesTo
  ) {
    return translationString.formatString(
      translationString.time_before,
      getArrivesTimeTo(item),
    );
  } else if ((arrivesFrom && !arrivesTo) || getArrivesTimeTo(item) === noTime) {
    return translationString.formatString(
      translationString.time_after,
      getArrivesTimeFrom(item),
    );
  } else if (arrivesFrom && arrivesTo && arrivesFrom === arrivesTo) {
    return translationString.formatString(
      translationString.time_on_time,
      getArrivesTimeFrom(item),
    );
  } else {
    return getArrivesTimeFrom(item) + ' - ' + getArrivesTimeTo(item);
  }
};

export const gotoDetailScreen = (
  item,
  isVerified = false,
  isFoodWasteJob = false,
) => {
  AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
  let consigneeName = getConsignee(item);
  let trackNumModel = getTrackingNumberOrCount(item);
  if (item.customer) {
    const step = getStepCode(item.customer, item.currentStepCode, item.jobType);

    if (step && step.stepCode) {
      switch (step.stepCode) {
        case Constants.StepCode.PRE_CALL:
        case Constants.StepCode.PRE_CALL_COLLECT:
          if (step.stepNeedPhoto) {
            RootNavigation.navigate('PhotoFlowCamera', {
              job: item,
              stepCode: step.stepCode,
              photoTaking: step.stepNeedPhoto,
            });
          } else {
            RootNavigation.navigate('PreCallAction', {
              job: item,
              consigneeName: consigneeName,
              stepCode: step.stepCode,
            });
          }
          break;
        case Constants.StepCode.SIMPLE_POD:
        case Constants.StepCode.ESIGN_POD:
        case Constants.StepCode.BARCODE_POD:
        case Constants.StepCode.BARCODEESIGN_POD:
        case Constants.StepCode.ESIGNBARCODE_POD:
        case Constants.StepCode.SCAN_QR_POD:
          if (step.stepNeedVerifyItem && !isVerified && !isFoodWasteJob) {
            RootNavigation.navigate('VerifyQty', {
              job: item,
              consigneeName: consigneeName,
              stepCode: step.stepCode,
              trackNumModel: trackNumModel,
            });
          } else {
            RootNavigation.navigate('PodAction', {
              job: item,
              consigneeName: consigneeName,
              stepCode: step.stepCode,
              trackNumModel: trackNumModel,
              isVerified: isVerified,
            });
          }
          break;
        case Constants.StepCode.COLLECT:
        case Constants.StepCode.WEIGHT_CAPTURE:
          if (step.stepNeedPhoto) {
            RootNavigation.navigate('PhotoFlowCamera', {
              job: item,
              stepCode: step.stepCode,
              photoTaking: step.stepNeedPhoto,
            });
          } else {
            RootNavigation.navigate('CollectAction', {
              job: item,
              consigneeName: consigneeName,
              stepCode: step.stepCode,
              trackNumModel: trackNumModel,
            });
          }
          break;
        // case Constants.StepCode.VERIFY_QTY:
        //   RootNavigation.navigate('VerifyQty', {
        //     job: item,
        //     consigneeName: consigneeName,
        //     stepCode: step.stepCode,
        //     trackNumModel: trackNumModel,
        //   });
        //   break;
        case Constants.StepCode.ESIGN_POC:
          if (step.stepNeedVerifyItem && !isVerified && !isFoodWasteJob) {
            RootNavigation.navigate('VerifyQty', {
              job: item,
              consigneeName: consigneeName,
              stepCode: step.stepCode,
              trackNumModel: trackNumModel,
            });
          } else {
            RootNavigation.navigate('PocAction', {
              job: item,
              consigneeName: consigneeName,
              stepCode: step.stepCode,
              trackNumModel: trackNumModel,
              isVerified: isVerified,
            });
          }
          break;
        default:
          break;
      }
    }
  }
};

// ------------  Job Detail ------------

export const callUpdateSequenceApi = async (jobSequenceList, realm) => {
  try {
    const response = await ApiController.updateSequence(jobSequenceList);
    if (response.status === 200) {
      jobSequenceList.map(async (item) => {
        let selectedJob = JobRealmManager.getSelectedJob(realm, item.jobId);
        if (selectedJob) {
          let selectedJobModel = GeneralHelper.convertRealmObjectToJSON(
            selectedJob[0],
          );
          selectedJobModel.sequence = item.sequence;
          await JobRealmManager.updateJobData(selectedJobModel, realm);
        }
      });
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export const getJobWithCustomFilter = (selectedJob, stepCode, realm) => {
  let mappedJob = [];
  try {
    const filterList = [];
    const batchActionGroupBy = selectedJob.batchActionGroupBy;

    if (batchActionGroupBy) {
      const batchActionGroupByList = batchActionGroupBy.split(',');

      for (var x of batchActionGroupByList) {
        filterList.push({
          key: x,
          value: selectedJob[x],
        });
      }
    }
    const matchedJob = JobRealmManager.getJobWithCustomFilter(
      filterList,
      realm,
    );

    matchedJob.map((item) => {
      if (isJobCurrentStepMatch(item, stepCode)) {
        let jobModel = GeneralHelper.convertRealmObjectToJSON(item);
        Object.assign(jobModel, {isSelected: jobModel.id === selectedJob.id});
        mappedJob.push(jobModel);
      }
    });

    return mappedJob;
  } catch (err) {
    return mappedJob;
  }
};

export const isJobCurrentStepMatch = (item, step) => {
  const currentStepCode = item.currentStepCode;
  const stepCode = item.customer?.customerSteps?.find(
    (x) => x.sequence === currentStepCode && x.jobType === item.jobType,
  )?.stepCode;

  return stepCode === step;
};
