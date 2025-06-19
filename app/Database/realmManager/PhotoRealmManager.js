import * as Constants from '../../CommonConfig/Constants';

export const insertNewPhotoData = (photoModel, realm) => {
  realm.write(() => {
    realm.create(Constants.PHOTO_ENTRY_SCHEMA, photoModel);
  });
};

export const updatePhotoData = (photoModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.PHOTO_ENTRY_SCHEMA,
      photoModel.uuid,
    );

    if (photoModel.jobId) {
      updateModel.jobId = photoModel.jobId;
    }

    if (photoModel.actionId) {
      updateModel.actionId = photoModel.actionId;
    }

    if (photoModel.file) {
      updateModel.file = photoModel.file;
    }

    if (photoModel.syncStatus !== null) {
      updateModel.syncStatus = photoModel.syncStatus;
    }

    if (photoModel.source !== null) {
      updateModel.source = photoModel.source;
    }
  });
};

export const updatePhotoSyncStatusByAction = (actionId, syncStatus, realm) => {
  realm.write(() => {
    let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
    let filteredResult = allResult.filtered(` actionId = "${actionId}" `);

    filteredResult.map((element) => {
      element.syncStatus = syncStatus;
    });
  });
};

export const updateSyncStatusByUUID = (uuid, syncStatus, realm) => {
  realm.write(() => {
    let selectedResult = realm.objectForPrimaryKey(
      Constants.PHOTO_ENTRY_SCHEMA,
      uuid,
    );

    selectedResult.syncStatus = syncStatus;
  });
};

export const queryAllPhotoData = (realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  return allResult;
};

export const deleteAllPhotoData = (realm) => {
  realm.write(() => {
    let photoList = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
    realm.delete(photoList);
  });
};

export const deletePhotoByUUID = (uuid, realm) => {
  realm.write(() => {
    let selectedResult = realm.objectForPrimaryKey(
      Constants.PHOTO_ENTRY_SCHEMA,
      uuid,
    );
    realm.delete(selectedResult);
  });
};

export const deleteAllPendingSelectPhotoData = (realm) => {
  realm.write(() => {
    let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
    let filteredResult = allResult.filtered(
      `syncStatus == ${Constants.SyncStatus.PENDING_SELECT_PHOTO}`,
    );
    realm.delete(filteredResult);
  });
};

//Handle for kill app relaunch to avoid it delete current action's photos
export const deleteAllPendingSelectPhotoDataExcptCurrentAction = (
  realm,
  actionId,
) => {
  realm.write(() => {
    let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
    let filteredResult = allResult.filtered(
      `syncStatus == ${Constants.SyncStatus.PENDING_SELECT_PHOTO} AND actionId != "${actionId}"`,
    );
    realm.delete(filteredResult);
  });
};

//Handle delete duplicate esign photo when user click back from e-sign screen
export const deletePendingSelectSignaturePhotoByAction = (realm, actionId) => {
  realm.write(() => {
    const allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
    const filteredResult = allResult.filter(
      (e) =>
        e.syncStatus === Constants.SyncStatus.PENDING_SELECT_PHOTO &&
        (e.source === Constants.SourceType.ESIGNATURE ||
          e.source === Constants.SourceType.ESIGNATURE_WITHOUT_ORDER_NUMBER) &&
        e.actionId === actionId,
    );

    realm.delete(filteredResult);
  });
};

export const getAllPhotosByStatus = (syncStatus, realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncStatus == ${syncStatus} SORT (createDate ASC) `,
  );
  return filteredResult;
};

export const getAllPendingFileByAction = (actionId, syncStatus, realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncStatus == ${syncStatus} AND actionId = "${actionId}"  SORT(createDate ASC) `,
  );

  return filteredResult;
};

export const getAllPendingFileByJobId = (syncStatus, jobId, realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncStatus == ${syncStatus} AND jobId == ${jobId} `,
  );
  return filteredResult;
};

export const getAllPendingFileNameByJobId = (syncStatus, photoModel, realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncStatus == ${syncStatus} AND jobId == ${photoModel.jobId} `,
  );
  return filteredResult;
};

export const getAllPhotoByJob = (photoModel, realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  let filteredResult = allResult.filtered(
    `actionId = "${photoModel.actionId}" AND jobId == ${photoModel.jobId} `,
  );
  return filteredResult;
};

export const getPhotoByJobIdExceptStatus = (syncStatus, jobId, realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncStatus != ${syncStatus} AND jobId == ${jobId} and source != 2`,
  );
  return filteredResult;
};

export const getAllPhotoByActionGuid = (actionId, realm) => {
  let allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  return allResult.filtered(` actionId = "${actionId}" `);
};

export const getAllPhotosToUploadByAction = (actionId, realm) => {
  const allResult = realm.objects(Constants.PHOTO_ENTRY_SCHEMA);
  const filteredResult = allResult.filtered(
    `actionId = "${actionId}" AND (syncStatus = ${Constants.SyncStatus.SYNC_PENDING} OR syncStatus = ${Constants.SyncStatus.SYNC_FAILED}) SORT(createDate ASC)`,
  );
  return filteredResult;
};

export const getDistinctActionIdsForUpload = (realm) => {
  const photosToUpload = realm
    .objects(Constants.PHOTO_ENTRY_SCHEMA)
    .filtered(
      `syncStatus = ${Constants.SyncStatus.SYNC_PENDING} OR syncStatus = ${Constants.SyncStatus.SYNC_FAILED}`,
    );

  const distinctActionIds = [
    ...new Set(photosToUpload.map((photo) => photo.actionId)),
  ];
  return distinctActionIds;
};
