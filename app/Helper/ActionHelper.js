import * as Constants from '../CommonConfig/Constants';
import * as JobHelper from './JobHelper';
import * as ActionRealmManager from '../Database/realmManager/ActionRealmManager';
import * as ActionOrderRealmManager from '../Database/realmManager/ActionOrderItemRealmManager';
import * as OrderItemRealmManager from '../Database/realmManager/OrderItemRealmManager';
import * as OrderRealmManager from '../Database/realmManager/OrderRealmManager';
import * as JobRealmManager from '../Database/realmManager/JobRealmManager';
import * as PhotoRealmManager from '../Database/realmManager/PhotoRealmManager';
import * as GeneralHelper from './GeneralHelper';
import moment from 'moment';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

export const generateActionModel = (
  jobId,
  stepCode,
  isSuccess,
  locationModel,
  additionalParamJson,
  photoTaking = false,
) => {
  let syncPhotoValue = Constants.SyncStatus.SYNC_PENDING;
  if (
    (isSuccess &&
      stepCode !== Constants.StepCode.ESIGN_POD &&
      stepCode !== Constants.StepCode.BARCODEESIGN_POD &&
      stepCode !== Constants.StepCode.ESIGNBARCODE_POD &&
      stepCode !== Constants.StepCode.ESIGN_POC &&
      !photoTaking) ||
    (!isSuccess && stepCode === Constants.StepCode.BARCODEESIGN_POD)
  ) {
    syncPhotoValue = Constants.SyncStatus.SYNC_SUCCESS;
  }
  let actionModel = {
    guid: uuidv4(),
    actionType: JobHelper.getActionType(stepCode, isSuccess),
    jobId: jobId,
    syncPhoto: syncPhotoValue,
    //Only success pick up required to pass order item list
    syncItem: !(isSuccess && stepCode === Constants.StepCode.COLLECT)
      ? Constants.SyncStatus.SYNC_SUCCESS
      : Constants.SyncStatus.SYNC_PENDING,
    operateTime: moment().format(),
    longitude: locationModel.longitude,
    latitude: locationModel.latitude,
    reasonDescription: '',
  };

  if (additionalParamJson) {
    actionModel.additionalParamsJson = additionalParamJson;
  }

  return actionModel;
};

export const generateCallActionModel = (
  job,
  stepCode,
  isSuccess,
  locationModel,
) => {
  let actionModel = {
    guid: uuidv4(),
    actionType: JobHelper.getCallActionType(stepCode, isSuccess),
    jobId: job.id,
    syncPhoto: isSuccess
      ? Constants.SyncStatus.SYNC_SUCCESS
      : Constants.SyncStatus.SYNC_PENDING,
    //Only success pick up required to pass order item list
    syncItem: !(isSuccess && job.stepCode === Constants.StepCode.COLLECT)
      ? Constants.SyncStatus.SYNC_SUCCESS
      : Constants.SyncStatus.SYNC_PENDING,
    operateTime: moment().format(),
    longitude: locationModel.longitude,
    latitude: locationModel.latitude,
  };

  if (job.additionalParamJson && job.additionalParamJson.length > 0) {
    actionModel.additionalParamsJson = job.additionalParamJson;
  }

  return actionModel;
};

export const generateSkipAction = (job, locationModel) => {
  let actionModel = {
    guid: uuidv4(),
    actionType: Constants.ActionType.PRE_CALL_SKIP,
    jobId: job.id,
    syncItem: Constants.SyncStatus.SYNC_SUCCESS,
    longitude: locationModel.longitude,
    latitude: locationModel.latitude,
    operateTime: moment().format(),
  };

  if (job.additionalParamJson && job.additionalParamJson.length > 0) {
    actionModel.additionalParamsJson = job.additionalParamJson;
  }

  return actionModel;
};

export const generateJobTransferAction = (isTransfer, locationModel) => {
  const actionModel = {
    guid: uuidv4(),
    actionType: isTransfer
      ? Constants.ActionType.JOB_TRANSFER
      : Constants.ActionType.JOB_RECEIVE,
    syncItem: Constants.SyncStatus.SYNC_SUCCESS,
    syncPhoto: Constants.SyncStatus.SYNC_SUCCESS,
    longitude: locationModel.longitude,
    latitude: locationModel.latitude,
  };

  return actionModel;
};

export const isValid = (stepCode, actionType) => {
  return (
    (actionType === Constants.ActionType.PRE_CALL_SUCCESS &&
      (stepCode === Constants.StepCode.PRE_CALL ||
        stepCode === Constants.StepCode.PRE_CALL_COLLECT)) ||
    (actionType === Constants.ActionType.POD_SUCCESS &&
      stepCode === Constants.StepCode.SIMPLE_POD) ||
    (actionType === Constants.ActionType.ESIGNATURE_POD &&
      stepCode === Constants.StepCode.ESIGN_POD) ||
    (actionType === Constants.ActionType.BARCODE_POD &&
      stepCode === Constants.StepCode.BARCODE_POD) ||
    (actionType === Constants.ActionType.BARCODEESIGN_POD &&
      stepCode === Constants.StepCode.BARCODEESIGN_POD) ||
    (actionType === Constants.ActionType.ESIGNBARCODE_POD &&
      stepCode === Constants.StepCode.ESIGNBARCODE_POD) ||
    (actionType === Constants.ActionType.ESIGNATURE_POC &&
      stepCode === Constants.StepCode.ESIGN_POC)
  );
};

export const updateActions = async (list, realm) => {
  list.map(async (item) => {
    if (item.id) {
      let selectedAction = ActionRealmManager.getActionByGuid(item.guid, realm);
      selectedAction = GeneralHelper.convertRealmObjectToJSON(selectedAction);
      selectedAction.id = item.id;
      selectedAction.syncStatus = Constants.SyncStatus.SYNC_SUCCESS;

      //update action order item status
      if (
        item.actionType === Constants.ActionType.COLLECT_SUCCESS ||
        item.actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL
      ) {
        let selectedList = ActionOrderRealmManager.getActionOrderByParentId(
          item.guid,
          realm,
        );

        selectedList.map(async (actionOrderModel) => {
          let selectedActionOrderItem =
            GeneralHelper.convertRealmObjectToJSON(actionOrderModel);
          selectedActionOrderItem.syncStatus =
            Constants.SyncStatus.SYNC_SUCCESS;
          selectedActionOrderItem.actionId = item.id;
          selectedActionOrderItem.parentId = item.guid;
          await ActionOrderRealmManager.updateActionOrderItemData(
            selectedActionOrderItem,
            realm,
          );
        });

        selectedAction.syncItem = Constants.SyncStatus.SYNC_SUCCESS;
      }

      await ActionRealmManager.updateActionData(selectedAction, realm);
      updateActionsWithPhoto(item, realm);
    }
  });
};

export const updateActionsSyncLock = async (list, realm) => {
  list.map(async (item) => {
    let selectedAction = ActionRealmManager.getActionByGuid(item.guid, realm);
    selectedAction = GeneralHelper.convertRealmObjectToJSON(selectedAction);
    selectedAction.syncStatus = Constants.SyncStatus.SYNC_LOCK;
    selectedAction.executeTime = moment().valueOf();

    await ActionRealmManager.updateActionData(selectedAction, realm);
  });
};

export const updateActionsSyncPending = async (list, realm) => {
  list.map(async (item) => {
    let selectedAction = ActionRealmManager.getActionByGuid(item.guid, realm);
    selectedAction = GeneralHelper.convertRealmObjectToJSON(selectedAction);
    selectedAction.syncStatus = Constants.SyncStatus.SYNC_PENDING;

    await ActionRealmManager.updateActionData(selectedAction, realm);
  });
};

export const updateActionsWithPhoto = async (actionModel, realm) => {
  let pendingPhotosByActionList =
    await PhotoRealmManager.getAllPendingFileByAction(
      actionModel.guid,
      Constants.SyncStatus.SYNC_PENDING,
      realm,
    );

  //if there are not pending photos in this action then update status to sync success
  if (!pendingPhotosByActionList || pendingPhotosByActionList.length === 0) {
    actionModel.syncPhoto = Constants.SyncStatus.SYNC_SUCCESS;
    await ActionRealmManager.updateActionData(actionModel, realm);
  }

  // to check sync status of job
  const jobId = actionModel.jobId;
  let selectedJob;

  if (
    actionModel.actionType === Constants.ActionType.JOB_RECEIVE ||
    actionModel.actionType === Constants.ActionType.JOB_TRANSFER
  ) {
    selectedJob = JobRealmManager.getSelectedJobDeleted(realm, jobId);
  } else {
    selectedJob = JobRealmManager.getSelectedJob(realm, jobId);
  }

  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);

    let actionsByJob = await ActionRealmManager.getAllPendingActionByJobId(
      Constants.SyncStatus.SYNC_PENDING,
      jobId,
      realm,
    );

    const photosByJobList = await PhotoRealmManager.getAllPendingFileByJobId(
      Constants.SyncStatus.SYNC_PENDING,
      jobId,
      realm,
    );

    // to check action order item sync status of job
    let actionItemsByJob = [];
    actionsByJob.map(async (item) => {
      let actionItemsByOrder =
        await ActionOrderRealmManager.getAllPendingActionOrderItemByActionId(
          Constants.SyncStatus.SYNC_PENDING,
          item.id,
        );
      if (actionItemsByOrder && actionItemsByOrder.length > 0) {
        actionItemsByJob.concat(actionItemsByOrder);
      }
    });

    // to check sync status of job
    selectedJob.isSynced = !(
      actionsByJob &&
      actionsByJob.length > 0 &&
      actionItemsByJob &&
      actionItemsByJob.length > 0 &&
      photosByJobList &&
      photosByJobList.length > 0
    );

    await JobRealmManager.updateJobData(selectedJob, realm);
  }
};

export const noPhotoRequired = (actionModel) => {
  actionModel.syncPhoto = Constants.SyncStatus.SYNC_SUCCESS;
};

export const isGeneralCall = (actionType) => {
  return (
    actionType === Constants.ActionType.GENERAL_CALL_FAIL ||
    actionType === Constants.ActionType.GENERAL_CALL_START ||
    actionType === Constants.ActionType.GENERAL_CALL_SUCCESS
  );
};

export const isPartialDelivery = (actionType, stepCode) => {
  return (
    actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL &&
    stepCode === Constants.StepCode.SIMPLE_POD
  );
};

export const isException = (actionType, stepCode) => {
  return (
    (actionType === Constants.ActionType.POD_FAIL &&
      (stepCode === Constants.StepCode.SIMPLE_POD ||
        stepCode === Constants.StepCode.ESIGN_POD ||
        stepCode === Constants.StepCode.BARCODE_POD ||
        stepCode === Constants.StepCode.BARCODEESIGN_POD ||
        stepCode === Constants.StepCode.ESIGNBARCODE_POD)) ||
    (actionType === Constants.ActionType.COLLECT_FAIL &&
      stepCode === Constants.StepCode.COLLECT) ||
    (actionType === Constants.ActionType.POC_FAIL &&
      stepCode === Constants.StepCode.ESIGN_POC)
  );
};

export const isPreCallSkipOrFailed = (actionType, stepCode) => {
  return (
    (actionType === Constants.ActionType.PRE_CALL_SKIP ||
      actionType === Constants.ActionType.PRE_CALL_FAIL) &&
    (stepCode === Constants.StepCode.PRE_CALL ||
      stepCode === Constants.StepCode.PRE_CALL_COLLECT)
  );
};

export const checkForExsitingAction = async (actionModel, realm) => {
  let isExist = false;
  const tempActionModel = await ActionRealmManager.getActionByGuid(
    actionModel.guid,
    realm,
  );
  if (tempActionModel) {
    isExist = true;
  }

  return isExist;
};

export const insertAction = async (actionModel, realm) => {
  try {
    ActionRealmManager.insertNewAction(actionModel, realm);
  } catch (error) {
    alert('Add Action Error: ' + error);
  }
};

export const generateCODAdditionalParamsJson = (
  orderList,
  job,
  totalActualCodAmt = 0,
  reasonId,
) => {
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
    codReason: reasonId,
    totalCod: totalActualCodAmt,
    codValueList: codValueList,
  };
  return JSON.stringify(additionParams);
};

export const insertPartialDeliveryActionAndOrderItem = async (
  job,
  actionModel,
  orderList,
  orderItemList,
  realm,
  isEsign = false,
  photoTaking = false,
) => {
  // -------- update job status --------
  let selectedJob = await JobRealmManager.getSelectedJob(realm, job.id);
  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);
    JobHelper.generateStatus(
      actionModel.reasonDescription,
      0,
      Constants.JobStatus.PARTIAL_DELIVERY,
      selectedJob,
    );

    selectedJob = await updateCODValueForJobAndOrder(
      selectedJob,
      actionModel,
      orderList,
      realm,
    );

    await JobRealmManager.updateJobData(selectedJob, realm);
  }
  // -------- update job status --------

  // -------- insert partial delivery action --------
  if (orderList && orderList.length > 0) {
    actionModel.orderId = orderList[0].id;
  }
  actionModel.syncPhoto =
    isEsign || photoTaking
      ? Constants.SyncStatus.SYNC_PENDING
      : Constants.SyncStatus.SYNC_SUCCESS;
  actionModel.syncItem = Constants.SyncStatus.SYNC_PENDING;
  await insertAction(actionModel, realm);
  // -------- insert partial delivery action --------

  // -------- insert action order and order items --------

  orderItemList.map(async (item) => {
    let actionOrderItemModel = {};
    actionOrderItemModel.id = Math.floor(Math.random() * Date.now());
    if (!item.isAddedFromLocal) {
      actionOrderItemModel.orderItemId = item.id;
    }
    actionOrderItemModel.qty = item.quantity;
    actionOrderItemModel.orderId = item.orderId;
    actionOrderItemModel.desc = item.description;
    actionOrderItemModel.expQty = item.expectedQuantity;
    actionOrderItemModel.actionId = actionModel.id;
    actionOrderItemModel.parentId = actionModel.guid;
    actionOrderItemModel.uom = item.uom;
    actionOrderItemModel.isContainer = item.isContainer;
    if (item.scanSkuTime !== '') {
      actionOrderItemModel.scanSkuTime = item.scanSkuTime;
    }
    await ActionOrderRealmManager.insertNewActionOrderItem(
      actionOrderItemModel,
      realm,
    );
    await OrderItemRealmManager.updateOrderItemById(
      item,
      realm,
      item.isContainer,
    );
  });
  // -------- insert action order and order items --------
};

export const insertScanSkuActionActionAndOrderItem = async (
  job,
  actionModel,
  orderList,
  orderItemList,
  realm,
  isEsign = false,
  photoTaking = false,
) => {
  // -------- update job status --------
  let selectedJob = await JobRealmManager.getSelectedJob(realm, job.id);
  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);
    selectedJob = await updateCODValueForJobAndOrder(
      selectedJob,
      actionModel,
      orderList,
      realm,
    );

    await JobRealmManager.updateJobData(selectedJob, realm);
  }
  // -------- update job status --------

  // -------- insert partial delivery action --------
  if (orderList && orderList.length > 0) {
    actionModel.orderId = orderList[0].id;
  }
  actionModel.syncPhoto =
    isEsign || photoTaking
      ? Constants.SyncStatus.SYNC_PENDING
      : Constants.SyncStatus.SYNC_SUCCESS;
  actionModel.syncItem = Constants.SyncStatus.SYNC_PENDING;
  await insertAction(actionModel, realm);
  // -------- insert partial delivery action --------

  // -------- insert action order and order items --------

  orderItemList.map(async (item) => {
    let actionOrderItemModel = {};
    actionOrderItemModel.id = Math.floor(Math.random() * Date.now());
    if (!item.isAddedFromLocal) {
      actionOrderItemModel.orderItemId = item.id;
    }
    actionOrderItemModel.qty = item.expectedQuantity;
    actionOrderItemModel.orderId = item.orderId;
    actionOrderItemModel.desc = item.description;
    actionOrderItemModel.expQty = item.expectedQuantity;
    actionOrderItemModel.actionId = actionModel.id;
    actionOrderItemModel.parentId = actionModel.guid;
    actionOrderItemModel.uom = item.uom;
    actionOrderItemModel.scanSkuTime = item.scanSkuTime;
    actionOrderItemModel.isContainer = item.isContainer;
    await ActionOrderRealmManager.insertNewActionOrderItem(
      actionOrderItemModel,
      realm,
    );
    await OrderItemRealmManager.updateOrderItemById(
      item,
      realm,
      item.isContainer,
    );
  });
  // -------- insert action order and order items --------
};

export const insertScanSkuActionAction = async (
  actionModel,
  orderItemList,
  realm,
) => {
  // -------- insert action order --------
  orderItemList.map(async (item) => {
    if (item.scanSkuTime !== '') {
      let actionOrderItemModel = {};
      actionOrderItemModel.id = Math.floor(Math.random() * Date.now());
      if (!item.isAddedFromLocal) {
        actionOrderItemModel.orderItemId = item.id;
      }
      actionOrderItemModel.qty = item.expectedQuantity;
      actionOrderItemModel.orderId = item.orderId;
      actionOrderItemModel.desc = item.description;
      actionOrderItemModel.expQty = item.expectedQuantity;
      actionOrderItemModel.actionId = actionModel.id;
      actionOrderItemModel.parentId = actionModel.guid;
      actionOrderItemModel.uom = item.uom;
      actionOrderItemModel.scanSkuTime = item.scanSkuTime;
      actionOrderItemModel.isContainer = item.isContainer;
      await ActionOrderRealmManager.insertNewActionOrderItem(
        actionOrderItemModel,
        realm,
      );
      await OrderItemRealmManager.updateOrderItemById(
        item,
        realm,
        item.isContainer,
      );
    }
  });
};

export const insertCollectActionAndOrderItem = async (
  job,
  actionModel,
  orderList,
  orderItemList,
  realm,
) => {
  // -------- update job status --------
  let selectedJob = await JobRealmManager.getSelectedJob(realm, job.id);
  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);
    JobHelper.generateStatus(
      actionModel.reasonDescription,
      selectedJob.currentStepCode,
      Constants.JobStatus.COMPLETED,
      selectedJob,
    );

    selectedJob = await updateCODValueForJobAndOrder(
      selectedJob,
      actionModel,
      orderList,
      realm,
    );

    await JobRealmManager.updateJobData(selectedJob, realm);
  }
  // -------- update job status --------

  // -------- insert collect action --------

  if (orderList && orderList.length > 0) {
    actionModel.orderId = orderList[0].id;
  }

  actionModel.syncItem = Constants.SyncStatus.SYNC_PENDING;
  await insertAction(actionModel, realm);
  // -------- insert collect action --------

  // -------- insert action order and order items --------

  orderItemList.map(async (item) => {
    let actionOrderItemModel = {};
    actionOrderItemModel.id = Math.floor(Math.random() * Date.now());
    if (!item.isAddedFromLocal) {
      actionOrderItemModel.orderItemId = item.id;
    }
    actionOrderItemModel.qty = item.quantity;
    actionOrderItemModel.orderId = item.orderId;
    actionOrderItemModel.desc = item.description;
    actionOrderItemModel.expQty = item.expectedQuantity;
    actionOrderItemModel.actionId = actionModel.id;
    actionOrderItemModel.parentId = actionModel.guid;
    actionOrderItemModel.uom = item.uom;
    if (item.scanSkuTime !== '') {
      actionOrderItemModel.scanSkuTime = item.scanSkuTime;
    }
    actionOrderItemModel.isContainer = item.isContainer;
    await ActionOrderRealmManager.insertNewActionOrderItem(
      actionOrderItemModel,
      realm,
    );
    await OrderItemRealmManager.updateOrderItemById(
      item,
      realm,
      item.isContainer,
    );
  });
  // -------- insert action order and order items --------
};

export const updateCODValueForJobAndOrder = async (
  selectedJob,
  actionModel,
  orderList,
  realm,
) => {
  if (
    actionModel.additionalParamsJson &&
    actionModel.additionalParamsJson.length > 0
  ) {
    let additionalParam = JSON.parse(actionModel.additionalParamsJson);

    orderList.map(async (item) => {
      let order = OrderRealmManager.getOrderById(item, realm);
      let orderModel = GeneralHelper.convertRealmObjectToJSON(order);

      orderModel.codValue = item.codValue;

      await OrderRealmManager.updateOrderData(orderModel, realm);
    });

    if (
      additionalParam &&
      additionalParam.codValueList &&
      additionalParam.codValueList.length > 0
    ) {
      const codValueList = additionalParam.codValueList;
      let codValue = 0;

      codValueList.map((item) => {
        codValue += item.codValue;
      });
      selectedJob.codValue = codValue;
    }
  }

  return selectedJob;
};

export const updateActionExecuteTime = (failedActionList, realm) => {
  for (let failedAction of failedActionList) {
    const selectAction = ActionRealmManager.getActionByGuid(
      failedAction.guid,
      realm,
    );
    if (selectAction) {
      ActionRealmManager.updateActionExecuteTime(selectAction, realm);
    }
  }
};

export const insertPartialDeliveryActionForJobBin = async (
  job,
  actionModel,
  realm,
) => {
  let selectedJob = await JobRealmManager.getSelectedJob(realm, job.id);
  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);
    JobHelper.generateStatus(
      actionModel.reasonDescription,
      0,
      Constants.JobStatus.PARTIAL_DELIVERY,
      selectedJob,
    );

    await JobRealmManager.updateJobData(selectedJob, realm);
  }

  actionModel.syncItem = Constants.SyncStatus.SYNC_PENDING;
  await insertAction(actionModel, realm);
};

export const insertFailDeliveryActionForJobBin = async (
  job,
  actionModel,
  orderList,
  orderItemList,
  realm,
  isEsign = false,
  photoTaking = false,
) => {
  // -------- update job status --------
  let selectedJob = await JobRealmManager.getSelectedJob(realm, job.id);
  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);
    JobHelper.generateStatus(
      actionModel.reasonDescription,
      0,
      Constants.JobStatus.FAILED,
      selectedJob,
    );

    selectedJob = await updateCODValueForJobAndOrder(
      selectedJob,
      actionModel,
      orderList,
      realm,
    );

    await JobRealmManager.updateJobData(selectedJob, realm);
  }
  // -------- update job status --------

  // -------- insert partial delivery action --------
  if (orderList && orderList.length > 0) {
    actionModel.orderId = orderList[0].id;
  }
  actionModel.syncPhoto =
    isEsign || photoTaking
      ? Constants.SyncStatus.SYNC_PENDING
      : Constants.SyncStatus.SYNC_SUCCESS;
  actionModel.syncItem = Constants.SyncStatus.SYNC_PENDING;
  await insertAction(actionModel, realm);
  // -------- insert partial delivery action --------

  // -------- insert action order and order items --------

  orderItemList.map(async (item) => {
    let actionOrderItemModel = {};
    actionOrderItemModel.id = Math.floor(Math.random() * Date.now());
    if (!item.isAddedFromLocal) {
      actionOrderItemModel.orderItemId = item.id;
    }
    actionOrderItemModel.qty = item.quantity;
    actionOrderItemModel.orderId = item.orderId;
    actionOrderItemModel.desc = item.description;
    actionOrderItemModel.expQty = item.expectedQuantity;
    actionOrderItemModel.actionId = actionModel.id;
    actionOrderItemModel.parentId = actionModel.guid;
    actionOrderItemModel.uom = item.uom;
    actionOrderItemModel.isContainer = item.isContainer;
    if (item.scanSkuTime !== '') {
      actionOrderItemModel.scanSkuTime = item.scanSkuTime;
    }
    await ActionOrderRealmManager.insertNewActionOrderItem(
      actionOrderItemModel,
      realm,
    );
    await OrderItemRealmManager.updateOrderItemById(
      item,
      realm,
      item.isContainer,
    );
  });
  // -------- insert action order and order items --------
};

export const insertSuccessDeliveryActionForJobBin = async (
  job,
  actionModel,
  orderList,
  orderItemList,
  realm,
  isEsign = false,
  photoTaking = false,
) => {
  // -------- update job status --------
  let selectedJob = await JobRealmManager.getSelectedJob(realm, job.id);
  if (selectedJob && selectedJob.length > 0) {
    selectedJob = GeneralHelper.convertRealmObjectToJSON(selectedJob[0]);
    JobHelper.generateStatus(
      actionModel.reasonDescription,
      0,
      Constants.JobStatus.COMPLETED,
      selectedJob,
    );

    selectedJob = await updateCODValueForJobAndOrder(
      selectedJob,
      actionModel,
      orderList,
      realm,
    );

    await JobRealmManager.updateJobData(selectedJob, realm);
  }
  // -------- update job status --------

  // -------- insert partial delivery action --------
  if (orderList && orderList.length > 0) {
    actionModel.orderId = orderList[0].id;
  }
  actionModel.syncPhoto =
    isEsign || photoTaking
      ? Constants.SyncStatus.SYNC_PENDING
      : Constants.SyncStatus.SYNC_SUCCESS;
  actionModel.syncItem = Constants.SyncStatus.SYNC_PENDING;
  await insertAction(actionModel, realm);
  // -------- insert partial delivery action --------

  // -------- insert action order and order items --------

  orderItemList.map(async (item) => {
    let actionOrderItemModel = {};
    actionOrderItemModel.id = Math.floor(Math.random() * Date.now());
    if (!item.isAddedFromLocal) {
      actionOrderItemModel.orderItemId = item.id;
    }
    actionOrderItemModel.qty = item.quantity;
    actionOrderItemModel.orderId = item.orderId;
    actionOrderItemModel.desc = item.description;
    actionOrderItemModel.expQty = item.expectedQuantity;
    actionOrderItemModel.actionId = actionModel.id;
    actionOrderItemModel.parentId = actionModel.guid;
    actionOrderItemModel.uom = item.uom;
    actionOrderItemModel.isContainer = item.isContainer;
    if (item.scanSkuTime !== '') {
      actionOrderItemModel.scanSkuTime = item.scanSkuTime;
    }
    await ActionOrderRealmManager.insertNewActionOrderItem(
      actionOrderItemModel,
      realm,
    );
    await OrderItemRealmManager.updateOrderItemById(
      item,
      realm,
      item.isContainer,
    );
  });
  // -------- insert action order and order items --------
};
