import * as Constants from '../CommonConfig/Constants';
import * as PhotoRealmManager from '../Database/realmManager/PhotoRealmManager';
import * as ActionRealmManager from '../Database/realmManager/ActionRealmManager';
import * as ActionHelper from './ActionHelper';
import * as GeneralHelper from './GeneralHelper';
import * as ApiController from '../ApiController/ApiController';
import {addEventLog} from './AnalyticHelper';
import * as LogRealmManager from '../Database/realmManager/LogRealmManager';
// import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {v4 as uuidv4} from 'uuid';

export const getAllPhoto = async (realm) => {
  const photeList = await PhotoRealmManager.queryAllPhotoData(realm);
  const pendingPhotoPathList = [];

  photeList.forEach((item) => {
    const photoModel = GeneralHelper.convertRealmObjectToJSON(item);

    pendingPhotoPathList.push(photoModel);
  });

  return pendingPhotoPathList;
};

export const getAllActionWithPendingPhoto = async (
  realm,
  showLoginModal,
  auth,
) => {
  try {
    let pendingActionList = [];
    // console.log('syncPhoto@@@ 1');
    const distinctActionIds =
      await PhotoRealmManager.getDistinctActionIdsForUpload(realm);

    if (distinctActionIds && distinctActionIds.length > 0) {
      const actionsToProcess =
        await ActionRealmManager.getActionsForPhotoUploadByIds(
          realm,
          distinctActionIds,
        );
      actionsToProcess.map((item) => {
        let actionModel = GeneralHelper.convertRealmObjectToJSON(item);
        pendingActionList.push(actionModel);
      });
    } else {
      console.log(
        'getAllActionWithPendingPhoto: No actions with photos to upload.',
      );
      // No need to proceed further if there are no actions
      return;
    }
    addEventLog('upload_photo', {
      actioncount: pendingActionList.length.toString(), // Changed from localActionList to pendingActionList
    });
    // 2 actions
    for (let pendingAction of pendingActionList) {
      try {
        const output = await uploadAllPhotosByActionId(
          pendingAction,
          realm,
          showLoginModal,
          auth,
        );
      } catch (err) {
        addEventLog('upload_photo_failed', {
          uploadphotofailed: err,
        });
        // Variable not found
        // failedAction++;
      }
    }
  } catch (error) {
    alert('Get Pending Photo Error: ' + error);
  }
};

const uploadAllPhotosByActionId = async (
  actionModel,
  realm,
  showLoginModal,
  auth,
) => {
  try {
    const pendingPhotoList = [];
    const pendingPhotoPathList = [];

    // Fetch photos with SYNC_PENDING or SYNC_FAILED status
    const photosToUpload = await PhotoRealmManager.getAllPhotosToUploadByAction(
      actionModel.guid,
      realm,
    );

    if (!photosToUpload || photosToUpload.length === 0) {
      console.log(
        `uploadAllPhotosByActionId: No photos to upload for action ${actionModel.guid}`,
      );
      // update progress and rechecked any pending unsync photo - This might still be relevant if action status depends on photo counts
      await ActionHelper.updateActionsWithPhoto(actionModel, realm);
      return; // No photos to process
    }

    // Set status to SYNC_LOCK for all photos being processed and prepare lists
    for (const photo of photosToUpload) {
      await PhotoRealmManager.updateSyncStatusByUUID(
        photo.uuid,
        Constants.SyncStatus.SYNC_LOCK,
        realm,
      );
      const photoModel = GeneralHelper.convertRealmObjectToJSON(photo);
      pendingPhotoList.push(photoModel);
      pendingPhotoPathList.push(photoModel.file);
    }

    if (pendingPhotoList && pendingPhotoList.length > 0) {
      let selectedAction = await ActionRealmManager.getActionByGuid(
        actionModel.guid,
        realm,
      );
      selectedAction = GeneralHelper.convertRealmObjectToJSON(selectedAction);
      const fileNameList = pendingPhotoPathList.map(
        (f) => f.split('/')[f.split('/').length - 1],
      );

      let signedUrlsResponse;
      try {
        signedUrlsResponse = await ApiController.uploadFile(
          actionModel.id,
          fileNameList,
        );
      } catch (error) {
        console.error('Failed to get signed URLs:', error);
        addEventLog('upload_photo_signedurl_failed', {
          actionId: actionModel.guid,
          error: JSON.stringify(error),
        });
        for (const photo of pendingPhotoList) {
          await PhotoRealmManager.updateSyncStatusByUUID(
            photo.uuid,
            Constants.SyncStatus.SYNC_FAILED,
            realm,
          );
        }
        if (error.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED) {
          auth.setIsExpiredToken();
          showLoginModal();
        }
        return; // Stop processing for this action if signed URLs fail
      }

      const resultModel = signedUrlsResponse.data; // response for signed urls list

      if (resultModel && resultModel.length > 0) {
        for (let i = 0; i < resultModel.length; i += 1) {
          const uploadUrl = resultModel[i];
          const photoModel = pendingPhotoList[i];
          try {
            // Individual photo status already set to SYNC_LOCK
            const s3Response = await ApiController.uploadPhoto(
              uploadUrl,
              photoModel.file,
            );

            if (
              s3Response !== null &&
              s3Response !== undefined &&
              s3Response.status === 200
            ) {
              const attachmentModel = {
                actionId: actionModel.id,
                thumbnailUrl: uploadUrl,
                url: uploadUrl,
                source: photoModel.source,
              };
              actionModel.actionAttachment = [attachmentModel];

              try {
                const updateActionResponse = await ApiController.updateAction(
                  actionModel.id,
                  actionModel,
                );

                if (updateActionResponse.status === 200) {
                  const updateActionModel = updateActionResponse.data;
                  // console.log('updateAction response: ', JSON.stringify(resultModel));

                  await PhotoRealmManager.updateSyncStatusByUUID(
                    photoModel.uuid,
                    Constants.SyncStatus.SYNC_SUCCESS,
                    realm,
                  );
                  addEventLog('update_action_success', {
                    updateactionsuccess: JSON.stringify(updateActionModel),
                  });
                  // update progress and rechecked any pending unsync photo
                  await ActionHelper.updateActionsWithPhoto(actionModel, realm);
                  //TODO
                  // updateSuccessProgress(context, sizeOfPhoto, position, currentCount)
                } else {
                  // API updateAction failed after successful S3 upload
                  await PhotoRealmManager.updateSyncStatusByUUID(
                    photoModel.uuid,
                    Constants.SyncStatus.SYNC_FAILED,
                    realm,
                  );
                  addEventLog('upload_photo_updateaction_failed', {
                    photoUuid: photoModel.uuid,
                    error: JSON.stringify(updateActionResponse),
                  });
                  if (updateActionResponse) {
                    const errString = JSON.stringify(updateActionResponse);
                    LogRealmManager.insertLog(errString, realm);
                  }
                }
              } catch (error) {
                // Error during updateAction API call
                await PhotoRealmManager.updateSyncStatusByUUID(
                  photoModel.uuid,
                  Constants.SyncStatus.SYNC_FAILED,
                  realm,
                );
                addEventLog('upload_photo_updateaction_exception', {
                  photoUuid: photoModel.uuid,
                  error: JSON.stringify(error),
                });
                if (error) {
                  const errString = JSON.stringify(error);
                  LogRealmManager.insertLog(errString, realm);
                }

                if (
                  error.refreshErrorMsg &&
                  error.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
                ) {
                  auth.setIsExpiredToken();
                  showLoginModal();
                }
              }
            } else {
              // S3 upload failed (non-200 response or other issue)
              await PhotoRealmManager.updateSyncStatusByUUID(
                photoModel.uuid,
                Constants.SyncStatus.SYNC_FAILED,
                realm,
              );
              addEventLog('upload_photo_s3_failed', {
                photoUuid: photoModel.uuid,
                error: JSON.stringify(s3Response),
              });
              if (s3Response) {
                const errString = JSON.stringify(s3Response);
                LogRealmManager.insertLog(errString, realm);
              }
            }
          } catch (error) {
            // Exception during S3 upload or subsequent logic before API update call
            await PhotoRealmManager.updateSyncStatusByUUID(
              photoModel.uuid,
              Constants.SyncStatus.SYNC_FAILED,
              realm,
            );
            addEventLog('upload_photo_s3_exception', {
              photoUuid: photoModel.uuid,
              error: JSON.stringify(error),
            });
            if (error) {
              const errString = JSON.stringify(error);
              LogRealmManager.insertLog(errString, realm);
            }

            if (
              error.refreshErrorMsg &&
              error.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
            ) {
              auth.setIsExpiredToken();
              showLoginModal();
            }
          }
        }
      }
    } else {
      // update progress and rechecked any pending unsync photo
      await ActionHelper.updateActionsWithPhoto(actionModel, realm);
    }
  } catch (err) {
    console.error(
      `Error processing action ${actionModel.guid} for photo upload:`,
      err,
    );
    addEventLog('upload_photo_action_error', {
      actionId: actionModel.guid,
      error: JSON.stringify(err),
    });
    // Mark any photos that were locked but not successfully processed as FAILED
    for (const photo of pendingPhotoList) {
      try {
        // Check current status before overriding, it might have been set to FAILED already by inner loops or successfully synced
        const currentPhoto = await PhotoRealmManager.getPhotoByUUID(
          photo.uuid,
          realm,
        );
        if (
          currentPhoto &&
          currentPhoto.syncStatus === Constants.SyncStatus.SYNC_LOCK
        ) {
          await PhotoRealmManager.updateSyncStatusByUUID(
            photo.uuid,
            Constants.SyncStatus.SYNC_FAILED,
            realm,
          );
        }
      } catch (photoError) {
        console.error(
          `Error updating photo status to FAILED for ${photo.uuid} in main catch:`,
          photoError,
        );
        // Log this specific error if needed, but continue processing other photos
      }
    }

    if (err.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED) {
      auth.setIsExpiredToken();
      showLoginModal();
    }
    // Log the original error that brought us to this catch block
    if (err && typeof LogRealmManager.insertLog === 'function') {
      // Check if LogRealmManager and insertLog are available
      const errString = JSON.stringify(err);
      LogRealmManager.insertLog(errString, realm);
    }
  }
};

const getPendingPhotoByActionId = async (
  actionModel,
  realm,
  showLoginModal,
  auth,
) => {
  let pendingPhotoList = [];
  let pendingPhotoPathList = [];

  // console.log(
  //   'syncPhoto@@@ getPendingPhotoByActionId:  actionModel ',
  //   actionModel.guid,
  // );

  const localPhotoList = await PhotoRealmManager.getAllPendingFileByAction(
    actionModel.guid,
    Constants.SyncStatus.SYNC_PENDING,
    realm,
  );

  localPhotoList.map((item) => {
    let photoModel = GeneralHelper.convertRealmObjectToJSON(item);
    pendingPhotoList.push(photoModel);
    pendingPhotoPathList.push(photoModel.file);
  });

  //update action's syncPhoto to SYNC_SUCCESS if pendingPhotoList is empty
  //else loop it and upload to server
  if (pendingPhotoList && pendingPhotoList.length > 0) {
    let selectedAction = await ActionRealmManager.getActionByGuid(
      actionModel.guid,
      realm,
    );
    selectedAction = GeneralHelper.convertRealmObjectToJSON(selectedAction);
    await syncPendingPhoto(
      pendingPhotoList,
      pendingPhotoPathList,
      selectedAction,
      realm,
      showLoginModal,
      auth,
    );
  } else {
    // update progress and rechecked any pending unsync photo
    await ActionHelper.updateActionsWithPhoto(actionModel, realm);
  }
};

const syncPendingPhoto = async (
  pendingPhotoList,
  pendingPhotoPathList,
  actionModel,
  realm,
  showLoginModal,
  auth,
) => {
  await callUploadFileApi(
    pendingPhotoList,
    pendingPhotoPathList,
    actionModel,
    showLoginModal,
    auth,
    realm,
  );
};

const callUploadFileApi = async (
  pendingPhotoList,
  pendingPhotoPathList,
  actionModel,
  showLoginModal,
  auth,
  realm,
) => {
  const fileNameList = pendingPhotoPathList.map(
    (f) => f.split('/')[f.split('/').length - 1],
  );
  try {
    // console.log(
    //   'syncPhoto@@@ callUploadFileApi:  pendingPhotoPathList ',
    //   pendingPhotoPathList.length,
    // );
    const response = await ApiController.uploadFile(
      actionModel.id,
      fileNameList,
    );
    let resultModel = response.data;
    if (resultModel && resultModel.length > 0) {
      let uploadCompleteList = [];

      await resultModel.map(async (item, index) => {
        // hashMap[item] = pendingPhotoPathList[index];
        // console.log('syncPhoto@@@ callUploadFileToAmazoneApi:  ', index);
        console.log(
          'syncPhoto@@@ callUploadFileToAmazoneApi PhotoModel:  ',
          pendingPhotoList[index],
        );
        await callUploadFileToAmazoneApi(
          item,
          pendingPhotoList[index],
          actionModel,
          showLoginModal,
          auth,
          realm,
        );
        uploadCompleteList.push(index);
        addEventLog('upload_aws', {
          awsphotomodel: `${JSON.stringify(actionModel)}, ${item}`,
        });
        if (uploadCompleteList.length === resultModel.length) {
        }
      });

      // if (hashMap && hashMap.length > 0) {

      // }
    }
  } catch (err) {
    if (
      err.refreshErrorMsg &&
      err.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
    ) {
      auth.setIsExpiredToken();
      showLoginModal();
    }
  }
};

const callUploadFileToAmazoneApi = async (
  uploadUrl,
  photoModel,
  actionModel,
  showLoginModal,
  auth,
  realm,
) => {
  try {
    const response = await ApiController.uploadPhoto(
      uploadUrl,
      photoModel.file,
    );
    let resultModel = response.status;
    await callUpdateActionApi(
      actionModel,
      photoModel,
      showLoginModal,
      auth,
      realm,
      uploadUrl,
    );
  } catch (err) {
    addEventLog('upload_aws', {
      awsphotomodelfailed: err,
    });
    //firabse crashlytic - action id, user id, uplaod url, err
    alert('upload photo error: ' + err);
    if (
      err.refreshErrorMsg &&
      err.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
    ) {
      auth.setIsExpiredToken();
      showLoginModal();
    }
  }
};

const callUpdateActionApi = async (
  actionModel,
  photoModel,
  showLoginModal,
  auth,
  realm,
  uploadUrl,
) => {
  const attachmentModel = {
    actionId: actionModel.id,
    thumbnailUrl: uploadUrl,
    url: uploadUrl,
    source: photoModel.source,
  };
  actionModel.actionAttachment = [attachmentModel];
  try {
    const response = await ApiController.updateAction(
      actionModel.id,
      actionModel,
    );
    if (response.status === 200) {
      let resultModel = response.data;
      await PhotoRealmManager.updateSyncStatusByUUID(
        photoModel.uuid,
        Constants.SyncStatus.SYNC_SUCCESS,
        realm,
      );
      // update progress and rechecked any pending unsync photo
      await ActionHelper.updateActionsWithPhoto(actionModel, realm);
      // updateSuccessProgress(context, sizeOfPhoto, position, currentCount)
    }
  } catch (err) {
    addEventLog('update_action_api', {
      updateactionfailed: err,
    });
    alert('updateAction error: ' + err);
    if (
      err.refreshErrorMsg &&
      err.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
    ) {
      auth.setIsExpiredToken();
      showLoginModal();
    }
  }
};

export const updatePhotoSyncStatusByAction = async (actionModel, epodRealm) => {
  try {
    await PhotoRealmManager.updatePhotoSyncStatusByAction(
      actionModel.guid,
      Constants.SyncStatus.SYNC_PENDING,
      epodRealm,
    );
  } catch (error) {
    alert('Update Photo SyncStatus: ' + error);
  }
};

export const updatePhotoSyncStatusByActionAndCloneToBatchAction = async (
  actionModel,
  batchActionModel,
  epodRealm,
) => {
  try {
    const photosRealm = await PhotoRealmManager.getAllPhotoByActionGuid(
      actionModel.guid,
      epodRealm,
    );

    await PhotoRealmManager.updatePhotoSyncStatusByAction(
      actionModel.guid,
      Constants.SyncStatus.SYNC_PENDING,
      epodRealm,
    );

    if (
      photosRealm &&
      photosRealm.length > 0 &&
      batchActionModel &&
      batchActionModel.length > 0
    ) {
      for (var i of batchActionModel) {
        if (i.guid === actionModel.guid) {
          continue;
        }
        for (const photo of photosRealm) {
          const newPhoto = GeneralHelper.convertRealmObjectToJSON(photo);
          newPhoto.jobId = i.jobId;
          newPhoto.uuid = uuidv4();
          newPhoto.actionId = i.guid;
          newPhoto.syncStatus = Constants.SyncStatus.SYNC_PENDING;
          PhotoRealmManager.insertNewPhotoData(newPhoto, epodRealm);
        }
      }
    }
  } catch (error) {
    alert('Update Photo SyncStatus: ' + error);
  }
};

// export const deletePreviousExportedPhoto = async (take, groupName) => {
//   try {
//     uri = [];

//     let photeModel = await CameraRoll.getPhotos({
//       first: take,
//       groupName: groupName,
//     });
//     console.log(photeModel);
//     if (photeModel !== undefined && photeModel.edges.length > 0) {
//       let edges = photeModel.edges;
//       let page_info = photeModel.page_info;

//       if (edges === undefined) return false;

//       for (var i of edges) {
//         uri.push(i.node.image.uri);
//         console.log(i.node.image.uri);
//       }
//       console.log(page_info);

//       while (page_info.has_next_page) {
//         photeModel = await CameraRoll.getPhotos({
//           first: take,
//           groupName: groupName,
//           after: page_info.end_cursor,
//         });

//         if (photeModel === undefined && photeModel.edges.length === 0) break;

//         edges = photeModel.edges;
//         page_info = photeModel.page_info;

//         if (edges === undefined) return false;

//         for (var i of edges) {
//           uri.push(i.node.image.uri);
//           console.log(i.node.image.uri);
//         }
//         console.log(page_info);
//       }
//       CameraRoll.deletePhotos(uri);
//     }
//     return true;
//   } catch {
//     return false;
//   }
// };
