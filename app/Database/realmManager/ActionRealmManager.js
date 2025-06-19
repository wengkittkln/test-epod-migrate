import Realm from 'realm';
import moment from 'moment';
import * as Constants from '../../CommonConfig/Constants';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as JobBinRealmManager from '../realmManager/JobBinRealmManager';

export const insertNewAction = (actionModel, realm) => {
  actionModel.executeTime = moment().valueOf();
  realm.write(() => {
    realm.create(Constants.ACTION_SCHEMA, actionModel);
  });
};

export const updateActionData = (actionModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.ACTION_SCHEMA,
      actionModel.guid,
    );

    if (actionModel.id) {
      updateModel.id = actionModel.id;
    }

    if (actionModel.jobId) {
      updateModel.jobId = actionModel.jobId;
    }

    if (actionModel.orderId) {
      updateModel.orderId = actionModel.orderId;
    }

    if (actionModel.actionType) {
      updateModel.actionType = actionModel.actionType;
    }

    if (actionModel.remark) {
      updateModel.remark = actionModel.remark;
    }

    if (actionModel.longitude) {
      updateModel.longitude = actionModel.longitude;
    }

    if (actionModel.latitude) {
      updateModel.latitude = actionModel.latitude;
    }

    if (
      actionModel.reasonDescription &&
      actionModel.reasonDescription.length > 0
    ) {
      updateModel.reasonDescription = actionModel.reasonDescription;
    }

    if (actionModel.operateTime && actionModel.operateTime.length > 0) {
      updateModel.operateTime = actionModel.operateTime;
    }

    if (
      actionModel.additionalParamsJson &&
      actionModel.additionalParamsJson.length > 0
    ) {
      updateModel.additionalParamsJson = actionModel.additionalParamsJson;
    }

    if (actionModel.syncStatus) {
      updateModel.syncStatus = actionModel.syncStatus;
    }

    if (actionModel.syncPhoto) {
      updateModel.syncPhoto = actionModel.syncPhoto;
    }

    if (actionModel.syncItem) {
      updateModel.syncItem = actionModel.syncItem;
    }

    if (actionModel.actionAttachment) {
      updateModel.actionAttachment = actionModel.actionAttachment;
    }

    if (actionModel.actionOrderItem) {
      updateModel.actionOrderItem = actionModel.actionOrderItem;
    }

    if (actionModel.executeTime) {
      updateModel.executeTime = actionModel.executeTime;
    }
  });
};

export const updateActionExecuteTime = (actionModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.ACTION_SCHEMA,
      actionModel.guid,
    );
    const currentTime = moment(updateModel.executeTime);
    const updatedTime = currentTime.add(5, 'minutes');
    updateModel.executeTime = updatedTime.valueOf();
  });
};

export const updateActionsSyncLockToPending = (realm, isForce = false) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  const filteredResult = allResult.filtered(
    `syncStatus = ${Constants.SyncStatus.SYNC_LOCK}`,
  );

  let lockActionList = [];

  filteredResult.map((item) => {
    let actionModel = GeneralHelper.convertRealmObjectToJSON(item);
    lockActionList.push(actionModel);
  });
  //
  lockActionList.map((item) => {
    const updateStatus = () => {
      realm.write(() => {
        let updateModel = realm.objectForPrimaryKey(
          Constants.ACTION_SCHEMA,
          item.guid,
        );

        updateModel.syncStatus = Constants.SyncStatus.SYNC_PENDING;
        updateModel.executeTime = moment().valueOf();
      });
    };

    if (!isForce) {
      if (
        moment().valueOf() >
        moment(item.executeTime).add(2, 'minutes').valueOf()
      ) {
        updateStatus();
      }
    } else {
      updateStatus();
    }
  });
};

export const getAllActionsByStatus = (statuses, realm) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  if (!statuses || statuses.length === 0) {
    return allResult; // Or handle as an error/empty array if preferred
  }
  const query = statuses.map((status) => `syncStatus = ${status}`).join(' OR ');
  return allResult.filtered(query);
};

export const getActionByGuid = (guid, realm) => {
  let selectedResult = realm.objectForPrimaryKey(Constants.ACTION_SCHEMA, guid);
  return selectedResult;
};

export const getAllPendingAction = (syncStatus, realm, isForce = false) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  let allJobBin = realm.objects(Constants.JOB_BIN_SCHEMA);
  const filteredJobBin = allJobBin.filter((bin) => !bin.isSynced);

  //executetime <= now
  if (isForce) {
    const filteredResult = allResult.filtered(`syncStatus = ${syncStatus} `);
    return filteredResult;
  }
  const output = allResult.filtered(
    `syncStatus = ${syncStatus}  AND executeTime <= ${moment().valueOf()}`,
  );

  const copyOutput = JSON.parse(JSON.stringify(output));

  copyOutput.forEach((action) => {
    action.actionJobBins = filteredJobBin.filter((bin) => {
      return bin.jobId === action.jobId;
    });

    action.actionJobBins.forEach((bin) =>
      JobBinRealmManager.updateJobBinSyncStatus(realm, bin),
    );
  });

  return copyOutput;
};

export const getAllPendingActionByJobId = (syncStatus, jobId, realm) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncStatus = ${syncStatus} AND jobId = ${jobId}`,
  );
  return filteredResult;
};

export const getSelectedAction = (guid, realm) => {
  let selectedResult = realm.objectForPrimaryKey(Constants.ACTION_SCHEMA, guid);
  return selectedResult;
};

export const queryAllActionData = (realm) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  return allResult;
};

export const deleteAllActionData = (realm) => {
  realm.write(() => {
    let actionList = realm.objects(Constants.ACTION_SCHEMA);
    realm.delete(actionList);
  });
};

export const getAllActionWithPendingPhoto = (syncStatus, realm) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncPhoto = ${syncStatus} and syncStatus = ${Constants.SyncStatus.SYNC_SUCCESS}`,
  );
  return filteredResult;
};

export const getPendingActionsAndPhotosCount = (realm) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncPhoto = ${Constants.SyncStatus.SYNC_PENDING} OR syncStatus = ${Constants.SyncStatus.SYNC_PENDING} OR syncStatus = ${Constants.SyncStatus.SYNC_LOCK}`,
  );
  return filteredResult;
};

export const getActionsForPhotoUploadByIds = (realm, guids) => {
  if (!guids || guids.length === 0) {
    return []; // Return empty if no GUIDs are provided
  }
  // Realm query to find actions where guid is in the list of guids
  // Example: guid == $0 OR guid == $1 OR ...
  const query = guids.map((guid, index) => `guid == $${index}`).join(' OR ');
  const actions = realm
    .objects(Constants.ACTION_SCHEMA)
    .filtered(query, ...guids);
  return actions;
};

export const getAllPendingLockAction = (realm) => {
  let allResult = realm.objects(Constants.ACTION_SCHEMA);
  //executetime <= now
  const filteredResult = allResult.filtered(
    `syncStatus = ${Constants.SyncStatus.SYNC_PENDING} OR syncStatus = ${Constants.SyncStatus.SYNC_LOCK}
    OR syncPhoto = ${Constants.SyncStatus.SYNC_PENDING} OR syncPhoto = ${Constants.SyncStatus.SYNC_LOCK}`,
  );
  return filteredResult;
};

export const updateActionsSyncToPendingBasedOnGUID = (realm, guid) => {
  try {
    const allResult = realm.objects(Constants.ACTION_SCHEMA);

    const filteredResult = allResult.filtered(`guid = '${guid}'`);

    filteredResult.forEach((item) => {
      realm.write(() => {
        const updateModel = realm.objectForPrimaryKey(
          Constants.ACTION_SCHEMA,
          item.guid,
        );

        if (updateModel) {
          updateModel.syncStatus = Constants.SyncStatus.SYNC_PENDING;
          updateModel.executeTime = moment().valueOf();
        }
      });
    });
  } catch (error) {
    console.error('Error updating actions based on GUID:', error);
  }
};
