/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {IndexContext} from '../../Context/IndexContext';
import * as ApiController from '../../ApiController/ApiController';
import * as Constants from '../../CommonConfig/Constants';
import * as ActionRealmManager from '../../Database/realmManager/ActionRealmManager';
import * as JobTransferRealmManager from '../../Database/realmManager/JobTransferRealmManager';
import * as ActionOrderItemRealmManager from '../../Database/realmManager/ActionOrderItemRealmManager';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as ActionHelper from '../../Helper/ActionHelper';
import * as PhotoHelper from '../../Helper/PhotoHelper';
import * as ActionType from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';
import {useRefreshTokenLogin} from '../RefreshTokenLogin/useRefreshTokenLogin';
import {addEventLog} from '../../Helper/AnalyticHelper';
import {SyncStatus} from './../../CommonConfig/Constants';
import notifee from '@notifee/react-native';

// add module-level flag to prevent duplicate network syncs across hook instances
let hasNetworkSyncExecuted = false;

export const useActionSync = () => {
  // let queue;

  // useEffect(async () => {
  //   queue = await queueFactory();
  //   console.log('aa', queue);
  //   queue.addWorker(
  //     'syncActionWorker',
  //     async (id, payload) => {
  //       console.log('EXECUTING "example-job" with id: ' + id);
  //       console.log(payload, 'payload');
  //       let pendingActionList = await getAllPendingAction();
  //       // keep alive until pendingActionList.length = 0
  //       while (pendingActionList && pendingActionList.length > 0) {
  //         console.log('db got data');
  //         await callActionSyncApi(pendingActionList);
  //         pendingActionList = await getAllPendingAction();
  //         console.log('db got data1');
  //       }
  //       // todo get photo
  //       await syncPhotos();

  //       // if (pendingActionList && pendingActionList.length > 0) {
  //       //   await callActionSyncApi(pendingActionList);
  //       // } else {
  //       //   await syncPhotos();
  //       // }
  //     },
  //     {
  //       concurrency: 1,
  //       onStart: async (id, payload) => {
  //         // const pendingActionList = await getAllPendingAction();
  //         // callActionSyncApi(pendingActionList);
  //         // get pending list
  //         // based on action
  //         console.log(
  //           'Job "job-name-here" with id ' + id + ' has started processing.',
  //         );
  //         AsyncStorage.setItem('QUEUE_ERROR', 'false');

  //         // call api
  //       },
  //       onCompletion: async (id, payload) => {
  //         console.log(
  //           'Job "job-name-here" with id ' + id + ' has completed processing.',
  //         );
  //         AsyncStorage.setItem('QUEUE_ERROR', 'false');
  //       },
  //       onSuccess: async (id, payload) => {
  //         AsyncStorage.setItem('QUEUE_ERROR', 'false');
  //         console.log('Job "job-name-here" with id ' + id + ' was successful.');
  //       },
  //       onFailure: async (id, payload) => {
  //         AsyncStorage.setItem('QUEUE_ERROR', 'true');

  //         console.log(
  //           'Job "job-name-here" with id ' +
  //             id +
  //             ' had an attempt end in failure.',
  //           payload,
  //         );
  //       },
  //     },
  //   );
  // }, []);

  const dispatch = useDispatch();
  const networkModel = useSelector((state) => state.NetworkReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const {auth, epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const {showLoginModal} = useRefreshTokenLogin();
  let isUploadingAction = false;
  const isUploadPhotoRef = useRef(false);
  const getAllPendingAction = async (isForce = false) => {
    try {
      let pendingActionList = [];
      //
      const localActionList = ActionRealmManager.getAllPendingAction(
        Constants.SyncStatus.SYNC_PENDING,
        epodRealm,
        isForce,
      );
      localActionList.map((item) => {
        let actionModel = GeneralHelper.convertRealmObjectToJSON(item);
        pendingActionList.push(actionModel);
      });
      console.log('pendingActionList.length', pendingActionList.length);
      //Add order item list if  pick up success
      pendingActionList.map((item) => {
        if (
          item.syncItem === Constants.SyncStatus.SYNC_PENDING &&
          (item.actionType === Constants.ActionType.COLLECT_SUCCESS ||
            item.actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL ||
            item.needScanSku)
        ) {
          let actionOrderItemList =
            ActionOrderItemRealmManager.getActionOrderByParentId(
              item.guid,
              epodRealm,
            );
          item.actionOrderItem = [
            ...item.actionOrderItem,
            ...actionOrderItemList,
          ];
        }
      });
      addEventLog('pending_action', {
        pendingaction: pendingActionList
          ? `${pendingActionList.length.toString()}, ${userModel.id}`
          : `0, ${userModel.id}`,
      });
      return pendingActionList;
    } catch (error) {
      alert('Get Pending Action Error: ' + error);
    }
  };

  const getAllPendingLockAction = async () => {
    try {
      const localActionList =
        ActionRealmManager.getAllPendingLockAction(epodRealm);

      return localActionList.length;
    } catch (error) {
      return 0;
    }
  };

  const getAllPendingJobTransferRequest = async () => {
    try {
      let pendingJobTransferRequestListList = [];
      //
      const localJTList = JobTransferRealmManager.getPendingJobTransfer(
        epodRealm,
      ).then((item) => {
        item.forEach((x) => {
          if (
            x.AcceptedBy === '' &&
            x.AcceptedDate === '' &&
            x.RequestedDate !== ''
          ) {
            pendingJobTransferRequestListList.push(x);
          }
        });
      });

      return pendingJobTransferRequestListList ?? [];
    } catch (error) {
      return [];
    }
  };

  const updateActionSyncLock = async (pendingActionList) => {
    addEventLog('sync_lock', {
      updatesynclock: `${userModel.id}; data: ${pendingActionList.length}`,
    });
    await ActionHelper.updateActionsSyncLock(pendingActionList, epodRealm);
  };

  const updateActionsSyncLockToPending = (isForce = false) => {
    addEventLog('sync_lock_to_pending', {
      updatesynclocktopending: `${userModel.id}`,
    });
    ActionRealmManager.updateActionsSyncLockToPending(epodRealm, isForce);

    const pendingCount = getAllPendingLockAction();

    if (pendingCount === 0) {
      cancelAllLocalNotification();
    }
  };

  const cancelAllLocalNotification = async () => {
    const noti = await notifee.getTriggerNotifications();
    for (var x of noti) {
      await notifee.cancelTriggerNotification(x.notification.id);
    }
  };

  const callActionSyncApi = async (pendingActionList) => {
    try {
      await updateActionSyncLock(pendingActionList);
      addEventLog('sync_action', {
        updatesyncaction: `${userModel.id}; data: ${pendingActionList.length}`,
      });
      const response = await ApiController.actionSync(pendingActionList);
      let resultModel = response.data;
      if (resultModel && resultModel.length > 0) {
        await ActionHelper.updateActions(resultModel, epodRealm);
      }
      await syncPhotos();
      isUploadingAction = false;
    } catch (err) {
      // update executeTime = now + 5
      await ActionHelper.updateActionsSyncPending(pendingActionList, epodRealm);
      ActionHelper.updateActionExecuteTime(pendingActionList, epodRealm);
      isUploadingAction = false;
      if (
        err.refreshErrorMsg &&
        err.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
      ) {
        auth.setIsExpiredToken();
        showLoginModal();
      }
    }
  };

  const callJobTransferSyncApi = async (pendingJobTransferList) => {
    console.log('Job Transfer Sync Api');
    console.log(pendingJobTransferList?.length);
    for (const y of pendingJobTransferList) {
      const idList = [];
      if (y.CompressString === undefined || y.CompressString === '') {
        return;
      }

      const jobList = y.CompressString.split('|').slice(4);

      jobList.forEach((x) => {
        const splitedResult = x.split(',');
        if (splitedResult.length === 2) {
          idList.push(Number(x.split(',')[0]));
        }
      });

      // console.log(idList);

      const response = await ApiController.confirmTransferRequest(
        idList,
        y.latitude,
        y.longitude,
      );
      if (response.status === 200) {
        if (response.data.message === '') {
          JobTransferRealmManager.updateSyncStatus(
            y.Id,
            SyncStatus.SYNC_SUCCESS,
            epodRealm,
          );
        }
      }
    }
  };

  let counter = 0;
  const startActionSync = async () => {
    //
    // if (!isUploadingAction) {
    // isUploadingAction = true;
    // const pendingActionList = await getAllPendingAction();
    // if (queue.status === 'inactive') {
    //   queue.createJob(
    //     'syncActionWorker',
    //     {data: 'test', attempts: 0},
    //     {
    //       // Number of times to attempt a failing job before marking job as failed and moving on.
    //       attempts: 0,
    //       // Higher priority jobs (10) get processed before lower priority jobs (-10).
    //       // Any int will work, priority 1000 will be processed before priority 10, though this is probably overkill.
    //       // Defaults to 0.fu
    //       priority: 10,
    //       timeout: 0, // api timeout after 60s
    //     },
    //     false,
    //   );
    //   queue.start();
    // }
  };

  // --------------------- Photo Module  --------------------------
  const syncPhotos = useCallback(async () => {
    if (isUploadPhotoRef.current) {
      console.log('syncPhotos: Already uploading photos.');
      return;
    }
    isUploadPhotoRef.current = true;
    console.log('syncPhotos: syncPhotos start');
    try {
      addEventLog('sync_action', {
        syncphoto: `${userModel?.id}; `,
      });
      await PhotoHelper.getAllActionWithPendingPhoto(
        epodRealm,
        showLoginModal,
        auth,
      );
      let payload = {
        isRefresh: true,
      };
      dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    } catch (error) {
      console.error('Error during syncPhotos:', error);
    } finally {
      isUploadPhotoRef.current = false;
    }
  }, [
    auth,
    dispatch,
    epodRealm,
    showLoginModal,
    userModel,
    PhotoHelper,
    addEventLog,
    createAction,
    ActionType.SET_JOBLIST_REFRESH,
  ]);
  // --------------------- Photo Module  --------------------------

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

  // useEffect(() => {
  //   const syncData = async () => {
  //     if (!networkModel.isConnected) return;

  //     try {
  //       const pending = await getAllPendingAction(true);
  //       if (pending?.length > 0) {
  //         await callActionSyncApi(pending);
  //       }
  //       await syncPhotos();
  //     } catch (error) {
  //       console.error('Sync failed:', error);
  //     }
  //   };

  //   // reset flag when disconnected, then only run syncData once when reconnected
  //   if (!networkModel.isConnected) {
  //     hasNetworkSyncExecuted = false;
  //     return;
  //   }

  //   if (!hasNetworkSyncExecuted) {
  //     hasNetworkSyncExecuted = true;
  //     syncData();
  //   }
  // }, [networkModel.isConnected]);

  // useEffect(() => {
  //   if (networkModel.isConnected) {
  //     console.log('Network connected, attempting to sync photos and actions.');
  //     syncPhotos();
  //   }
  // }, [networkModel.isConnected, syncPhotos]);

  return {
    startActionSync,
    getAllPendingAction,
    updateActionSyncLock,
    updateActionsSyncLockToPending,
    callActionSyncApi,
    syncPhotos,
    getAllPendingJobTransferRequest,
    callJobTransferSyncApi,
    getAllPendingLockAction,
  };
};
