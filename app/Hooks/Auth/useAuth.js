import React, {useEffect, useState} from 'react';
import {Platform, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACCESS_TOKEN,
  IS_DOWNLOAD_FAILED,
  REFRESH_TOKEN,
  USER_MODEL,
  PENDING_ACTION_LIST,
  PLATE_NO,
  LAST_JOB_SINCE,
} from '../../CommonConfig/Constants';
import {createAction} from '../../Actions/CreateActions';
import * as ActionType from '../../Actions/ActionTypes';
import * as Constants from '../../CommonConfig/Constants';
import * as ManifestRealmManager from '../../Database/realmManager/ManifestRealmManager';
import * as MasterDataRealmManager from '../../Database/realmManager/MasterDataRealmManager';
import * as VehicleLocationRealmManager from '../../Database/realmManager/VehichleLocationRealmManager';
import * as CustomerRealmManager from '../../Database/realmManager/CustomerRealmManager';
import * as ActionRealmManager from '../../Database/realmManager/ActionRealmManager';
import * as ActionOrderRealmManager from '../../Database/realmManager/ActionOrderItemRealmManager';
import * as AttachmentRealmManager from '../../Database/realmManager/AttachmentRealmManager';
import * as PhotoRealmManager from '../../Database/realmManager/PhotoRealmManager';
import * as LogRealmManager from '../../Database/realmManager/LogRealmManager';
import * as UsersRealmManager from '../../Database/realmManager/UsersRealmManager';
import * as ShopsRealmManager from '../../Database/realmManager/ShopsRealmManager';
import * as JobTransferRealmManager from '../../Database/realmManager/JobTransferRealmManager';
import * as ConfigurationRealmManager from '../../Database/realmManager/ConfigurationRealmManager';
import {translationString} from '../../Assets/translation/Translation';
import _BackgroundTimer from 'react-native-background-timer';
import {disconnectSignalR} from '../../Services/SignalRService';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useAuth = (masnifestData, epodRealm, EpodRealmHelper) => {
  const [noOrderMsg, setNoOrderMsg] = useState('');
  const [authState, dispatch] = React.useReducer(
    (state, action) => {
      switch (action.type) {
        case ActionType.USER_LOGIN:
          return {
            ...state,
            isLogin: true,
            isTokenExpired: false,
          };
        case ActionType.USER_LOGOUT:
          return {
            ...state,
            isLogin: false,
            isNoOrder: false,
            isTokenExpired: false,
          };
        case ActionType.SPLASH_SCREEN_START:
          return {
            ...state,
            isSplashScreen: true,
          };
        case ActionType.SPLASH_SCREEN:
          return {
            ...state,
            isSplashScreen: false,
            isLoaded: true,
          };
        case ActionType.SET_NO_ORDER_FLAG:
          return {
            ...state,
            isNoOrder: action.payload.isNoOrder,
          };
        case ActionType.SET_IS_TOKEN_EXPIRED_FLAG:
          return {
            ...state,
            isTokenExpired: action.payload.isTokenExpired,
          };

        case ActionType.SET_NO_PLATE_NUM_FLAG:
          return {
            ...state,
            isNoPlateNum: action.payload.isNoPlateNum,
          };

        case ActionType.KILL_APP_RELAUNCH:
          return {
            ...state,
            isSplashScreen: false,
            isNoOrder: false,
            isLogin: true,
          };
        default:
          return state;
      }
    },
    {
      isLogin: false,
      isLoaded: false,
      isSplashScreen: null,
      isNoOrder: true,
      isTokenExpired: true,
      isNoPlateNum: false,
    },
  );

  const stopTimer = async () => {
    _BackgroundTimer.stopBackgroundTimer();
  };

  const auth = React.useMemo(
    () => ({
      setIsExpiredToken: async () => {
        let tokenPayload = {
          isTokenExpired: true,
        };
        dispatch(
          createAction(ActionType.SET_IS_TOKEN_EXPIRED_FLAG, tokenPayload),
        );
      },
      updatePlateNo: async () => {
        let payload = {
          isNoPlateNum: true,
        };
        dispatch(createAction(ActionType.USER_LOGIN));
        dispatch(createAction(ActionType.SET_NO_PLATE_NUM_FLAG, payload));
      },

      loginWithOrder: async () => {
        let payload = {
          isNoOrder: false,
        };
        let tokenPayload = {
          isTokenExpired: false,
        };

        let plateNumPayload = {
          isNoPlateNum: false,
        };
        dispatch(createAction(ActionType.USER_LOGIN));
        dispatch(createAction(ActionType.SET_NO_ORDER_FLAG, payload));
        dispatch(
          createAction(ActionType.SET_IS_TOKEN_EXPIRED_FLAG, tokenPayload),
        );
        dispatch(
          createAction(ActionType.SET_NO_PLATE_NUM_FLAG, plateNumPayload),
        );
        AsyncStorage.removeItem(IS_DOWNLOAD_FAILED);
      },
      loginWithNoOrder: async (message, isDownloadFailed) => {
        let payload = {
          isNoOrder: true,
        };
        let tokenPayload = {
          isTokenExpired: false,
        };
        if (isDownloadFailed) {
          AsyncStorage.setItem(IS_DOWNLOAD_FAILED, '1');
        } else {
          AsyncStorage.removeItem(IS_DOWNLOAD_FAILED);
        }

        setNoOrderMsg(message);
        dispatch(createAction(ActionType.USER_LOGIN));
        dispatch(createAction(ActionType.SET_NO_ORDER_FLAG, payload));
        dispatch(
          createAction(ActionType.SET_IS_TOKEN_EXPIRED_FLAG, tokenPayload),
        );
      },
      logout: async () => {
        // Disconnect SignalR first
        await disconnectSignalR();

        EpodRealmHelper.updateManifestData({});
        EpodRealmHelper.updateMasterData([]);
        await AsyncStorage.removeItem(ACCESS_TOKEN);
        await AsyncStorage.removeItem(REFRESH_TOKEN);
        await AsyncStorage.removeItem(IS_DOWNLOAD_FAILED);
        await AsyncStorage.removeItem(USER_MODEL);
        await AsyncStorage.removeItem(PENDING_ACTION_LIST);
        await AsyncStorage.removeItem(PLATE_NO);
        await AsyncStorage.removeItem(LAST_JOB_SINCE);
        stopTimer();
        if (epodRealm !== undefined) {
          await ManifestRealmManager.deleteAllManifestData(epodRealm);
          await MasterDataRealmManager.deleteAllMasterData(epodRealm);
          await VehicleLocationRealmManager.deleteAllVehicleData(epodRealm);
          await CustomerRealmManager.deleteAllCustomerData(epodRealm);
          await ActionRealmManager.deleteAllActionData(epodRealm);
          await ActionOrderRealmManager.deleteAllActionOrderItemData(epodRealm);
          await AttachmentRealmManager.deleteAllAttachmentData(epodRealm);
          await PhotoRealmManager.deleteAllPhotoData(epodRealm);
          await LogRealmManager.deleteAllLog(epodRealm);
          await ConfigurationRealmManager.deleteAllConfigurations(epodRealm);
          UsersRealmManager.deleteAllUsers(epodRealm);
          ShopsRealmManager.deleteAllShops(epodRealm);
          JobTransferRealmManager.deleteAllJobTransfer(epodRealm);
        }
        await AsyncStorage.setItem(Constants.IS_LOGGED_IN, 'false');
        dispatch(createAction(ActionType.JOBLIST_FILTER_TYPE_RESET));
        dispatch(createAction(ActionType.USER_LOGOUT));
      },
    }),
    [epodRealm],
  );

  useEffect(() => {
    if (epodRealm && epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

  useEffect(() => {
    if (masnifestData && masnifestData.id) {
      let payload = {
        isNoOrder: false,
      };
      dispatch(createAction(ActionType.SET_NO_ORDER_FLAG, payload));
    }
  }, [masnifestData]);

  const getAccessToken = (isPendingActionScreen) => {
    AsyncStorage.getItem(ACCESS_TOKEN).then((result) => {
      if (result) {
        if (isPendingActionScreen) {
          //No need check no order and set to false if any screen need navigate to after kill app relaunch
          dispatch(createAction(ActionType.KILL_APP_RELAUNCH));
        } else {
          dispatch(createAction(ActionType.USER_LOGIN));
        }
      }

      dispatch(createAction(ActionType.SPLASH_SCREEN));
    });
  };

  useEffect(() => {
    AsyncStorage.getItem(Constants.LANGUAGE).then((res) => {
      if (res) {
        if (res) {
          let tokenPayload = {
            isTokenExpired: false,
          };
          dispatch(
            createAction(ActionType.SET_IS_TOKEN_EXPIRED_FLAG, tokenPayload),
          );
          // dispatch(createAction(ActionType.USER_LOGIN));
        }
        const languageModel = JSON.parse(res);
        const payload = languageModel;
        dispatch(createAction(ActionType.UPDATE_LANGUAGE, payload));
        translationString.setLanguage(languageModel.code);
      } else {
        translationString.setLanguage('zh-Hant');
      }
    });

    AsyncStorage.getItem(Constants.PENDING_ACTION_LIST).then((result) => {
      if (result) {
        getAccessToken(true);
      } else {
        // It delay the useAuth update value after kill the app and
        // will use initial value in app.js for render stack
        dispatch(createAction(ActionType.SPLASH_SCREEN_START));
        sleep(2000).then(async () => {
          getAccessToken(false);
        });
      }
    });

    AsyncStorage.getItem(Constants.IS_DOWNLOAD_FAILED).then((res) => {
      if (res === '1') {
        setNoOrderMsg(translationString.download_failed);
      } else {
        setNoOrderMsg(translationString.no_data);
      }
    });
  }, []);

  return {auth, authState, noOrderMsg};
};
