import {createAction} from '../Actions/CreateActions';
import * as ActionType from '../Actions/ActionTypes';
import * as ActionRealmManager from '../Database/realmManager/ActionRealmManager';
import * as JobTransferRealmManager from '../Database/realmManager/JobTransferRealmManager';
import {translationString} from '../Assets/translation/Translation';
import * as JobRealmManager from '../Database/realmManager/JobRealmManager';
import * as Constants from '../CommonConfig/Constants';
import {Alert} from 'react-native';
import * as ApiController from '../ApiController/ApiController';
import * as LogRealmManager from '../Database/realmManager/LogRealmManager';
import {useLocation} from '../Hooks/Location/useLocation';

const Logout = async (
  dispatch,
  networkModel,
  authState,
  auth,
  epodRealm,
  callActionSyncApi,
  getAllPendingAction,
  callGetMasterDataApi,
  callGetDeltaSyncApi,
  forceLogout,
  updateActionsSyncLockToPending,
  updateActionSyncLock,
  manifestId,
  userModel,
  ignoreCheckAndLogout = false,
  setGPSTracking,
) => {
  if (authState.isTokenExpired) {
    const payload = {
      isShowLoginModal: true,
    };
    dispatch(createAction(ActionType.SET_IS_SHOW_LOGIN_MODAL, payload));
  } else {
    if (networkModel.isConnected) {
      const pendingActionPhotoList =
        await ActionRealmManager.getPendingActionsAndPhotosCount(epodRealm);

      const pendingTransferList =
        await JobTransferRealmManager.getPendingJobTransferByDriverTo(
          epodRealm,
          userModel.id,
        );

      if (pendingActionPhotoList.length > 0) {
        // Get all pending jobs
        const currentPendingJobList =
          await JobRealmManager.getAllJobByRequestArrivalTimeFromAsc(epodRealm);
        const openJobList = currentPendingJobList.filter((jobModel) => {
          return jobModel.status <= Constants.JobStatus.IN_PROGRESS;
        });
        // Only turn off GPS tracking if there are no pending jobs
        if (currentPendingJobList.length === 0 || openJobList.length === 0) {
          console.log('Call from logout');
          setGPSTracking(false);
        }

        displayBottomAlertMessage(
          translationString.formatString(
            translationString.uploading_try_later,
            pendingActionPhotoList.length,
          ),
          dispatch,
        );
        updateActionsSyncLockToPending(true);
        var pendingList = await getAllPendingAction(true);
        await updateActionSyncLock(pendingList);
        callActionSyncApi(pendingList);
      } else if (pendingTransferList && pendingTransferList.length > 0) {
        displayBottomAlertMessage(
          translationString.formatString(
            translationString.job_transfers.logoutPendingRequest,
            pendingTransferList.length,
          ),
          dispatch,
        );
      } else {
        // delta and master sync before logout
        await callGetMasterDataApi();
        console.log(
          `[Delta Sync] Logout initiated. Timestamp: ${new Date().toISOString()}.`,
        );

        await callGetDeltaSyncApi();
        console.log(
          `[Delta Sync] Logout Ended. Timestamp: ${new Date().toISOString()}.`,
        );
        // check all list (local + new sync jobs)
        const updatedList =
          await JobRealmManager.getAllJobByRequestArrivalTimeFromAsc(epodRealm);
        checkCompletedJob(
          updatedList,
          forceLogout,
          auth,
          dispatch,
          manifestId,
          ignoreCheckAndLogout,
          setGPSTracking,
        );
      }
    } else {
      //Offline
      displayBottomAlertMessage(
        translationString.no_internet_connection,
        dispatch,
      );
    }
  }
};

export const displayBottomAlertMessage = (message, dispatch) => {
  let filterMsgPayload = {
    filterSuccessMsg: message,
  };
  dispatch(createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload));
};

export const checkCompletedJob = async (
  pendingJobList,
  forceLogout,
  auth,
  dispatch,
  manifestId,
  ignoreCheckAndLogout = false,
  setGPSTracking,
) => {
  if (ignoreCheckAndLogout) {
    Alert.alert(
      translationString.manifestRemoveMessage,
      translationString.manifestRemoveSubMessage,
      [
        {
          text: translationString.confirm,
          onPress: () => {
            callLogoutApi(auth, manifestId);
          },
        },
      ],
      {cancelable: false},
    );
  }

  const openJobList = pendingJobList.filter((jobModel) => {
    return jobModel.status <= Constants.JobStatus.IN_PROGRESS;
  });

  if (pendingJobList.length === 0 || openJobList.length === 0) {
    //logout
    if (!forceLogout) {
      Alert.alert(
        translationString.logout,
        translationString.logout_confirm,
        [
          {
            text: translationString.cancel,
            onPress: () => {},
          },
          {
            text: translationString.confirm,
            onPress: () => {
              callLogoutApi(auth, manifestId, setGPSTracking);
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      callLogoutApi(auth, manifestId, setGPSTracking);
    }
  } else {
    //pending job
    const pendingDeliverJobList = pendingJobList.filter((jobModel) => {
      return (
        jobModel.jobType === Constants.JobType.DELIVERY &&
        jobModel.status <= Constants.JobStatus.IN_PROGRESS &&
        !jobModel.isRemoved
      );
    });
    const pendingPickUpJobList = pendingJobList.filter((jobModel) => {
      return (
        jobModel.jobType === Constants.JobType.PICK_UP &&
        jobModel.status <= Constants.JobStatus.IN_PROGRESS &&
        !jobModel.isRemoved
      );
    });
    let alertMsg = translationString.please_complete_job;

    if (pendingDeliverJobList.length > 0) {
      alertMsg =
        alertMsg +
        translationString.formatString(
          translationString.pending_delivery_job_count,
          pendingDeliverJobList.length,
        );
    }

    if (pendingDeliverJobList.length > 0 && pendingPickUpJobList.length > 0) {
      alertMsg = alertMsg + translationString.and;
    }

    if (pendingPickUpJobList.length > 0) {
      alertMsg =
        alertMsg +
        translationString.formatString(
          translationString.pending_pickup_job_count,
          pendingPickUpJobList.length,
        );
    }
    displayBottomAlertMessage(alertMsg, dispatch);
  }
};

export const callLogoutApi = async (auth, manifestId, setGPSTracking) => {
  try {
    console.log('user proceed logout');
    // Stop GPS tracking before logging out
    setGPSTracking(false);
    await ApiController.userLogoutApi(manifestId);
    auth.logout();
  } catch (err) {
    let errorModel = err.response.data;
    alert(errorModel.errorMessage);
  }
};

export default Logout;
