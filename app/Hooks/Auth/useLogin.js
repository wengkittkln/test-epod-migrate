import React, {useEffect, useState} from 'react';
import {Platform, Alert, Dimensions, Linking, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAction} from '../../Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as Constants from '../../CommonConfig/Constants';
import * as ManifestRealmManager from '../../Database/realmManager/ManifestRealmManager';
import {translationString} from '../../Assets/translation/Translation';
import {
  userLoginApi,
  getNextManifestApi,
  regeisterDeviceApi,
  checkIs2FASetup,
  get2FAQRAndCode,
  verify2FA,
  checkIsNeedTwoFAVerification,
  requestSendResetPasswordEmail,
  requestResetPasswordWithPhoneNumber,
  requestNewOTP,
  resetPasswordWithOTP,
} from '../../ApiController/ApiController';
import {IndexContext} from '../../Context/IndexContext';
import {AppContext} from '../../Context/AppContext';
import {useNetwork} from '../Network/useNetwork';
import {useMasterData} from '../MasterData/useMasterData';
import {useDeltaSync} from '../DeltaSync/useDeltaSync';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import moment from 'moment';
import Orientation from 'react-native-orientation-locker';
import {
  ToastMessageMultiLine,
  ToastMessageErrorMultiLine,
} from '../../Components/Toast/ToastMessage';
import RNExitApp from 'react-native-exit-app';
import {getAppDownloadLink} from '../../ApiController/ApiConfig';
import {useJobRequest} from '../JobRequest/useJobRequest';

export const useLogin = (navigation) => {
  const loginModel = useSelector((state) => state.LoginReducer);
  const {networkModel} = useNetwork();
  const languageModel = useSelector((state) => state.LanguageReducer);
  const dispatch = useDispatch();
  const {callGetMasterDataApi} = useMasterData();
  const {callGetDeltaWithArg} = useDeltaSync(callGetMasterDataApi, 'useLogin');
  const {initializeSignalR} = React.useContext(AppContext);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const {auth, epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get('screen').width,
  );
  const [windowHeight, setWindowHeight] = useState(
    Dimensions.get('screen').height,
  );
  const [is2FAPage, setIs2FAPage] = useState(false);
  const [twoFAInfo, setTwoFAInfo] = useState({
    manualEntrySetupCode: '',
    qrCodeImageUrl: '',
  });
  const [isUserSetup2FA, setIsUserSetup2FA] = useState(false);
  const [userModel, setUserModel] = useState({});
  const [isRequestResetPassword, setIsRequestResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const {fetchPendingJobRequests, pendingRequests} = useJobRequest();

  const checkingBeforeUpdateLocalDb = (manifestResult, userModel) => {
    manifestResult.jobs.map((jobModel) => {
      jobModel.currentStepCode = jobModel.currentStep + 1;
    });
    insertManifestData(manifestResult);
    EpodRealmHelper.updateManifestData(manifestResult);
    callGetDeltaWithArg(manifestResult);
    if (userModel && userModel.plateNoRequest) {
      auth.updatePlateNo();
    } else {
      auth.loginWithOrder();
    }
  };

  const insertManifestData = async (manifestData) => {
    try {
      ManifestRealmManager.insertNewManifest(manifestData, epodRealm);
    } catch (error) {
      alert('insert manifest data error: ' + error);
    }
  };

  const callGetNextManifestDataApi = async (userModel) => {
    try {
      const response = await getNextManifestApi();
      setIsShowLoadingIndicator(false);
      let resultModel = response.data;

      if (response.status === Constants.NO_MANIFEST_ERROR_CODE) {
        let isDownloadFailed = false;
        let msg = translationString.no_data;
        auth.loginWithNoOrder(msg, isDownloadFailed);
      } else {
        if (resultModel) {
          checkingBeforeUpdateLocalDb(resultModel, userModel);
        }
      }
    } catch (err) {
      let isDownloadFailed = err.response.status === 204 ? false : true;
      let msg =
        err.response.status === 204
          ? translationString.no_data
          : translationString.download_failed;
      setIsShowLoadingIndicator(false);
      auth.loginWithNoOrder(msg, isDownloadFailed);
    }
  };

  const showAlertAsync = (title, message) => {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: translationString.okText,
            onPress: () => {
              resolve();
            },
          },
        ],
        {cancelable: false},
      );
    });
  };

  const callUserLoginApi = async () => {
    try {
      const response = await userLoginApi(loginModel);
      const resultModel = response.data;

      if (resultModel.isForceAppToUpdate) {
        Alert.alert(
          translationString.alert,
          translationString.forceUpdateMessage,
          [
            {
              text: translationString.okText,
              onPress: () => {
                directToAppLocation(getAppDownloadLink(Platform.OS));
              },
            },
          ],
          {cancelable: false},
        );
        setIsShowLoadingIndicator(false);
        return;
      }

      const result = {
        id: resultModel.id,
        name: resultModel.name,
        truckNo: resultModel.truckNo,
        phoneNumber: resultModel.phoneNumber,
        username: loginModel.username,
        plateNoRequest: resultModel.plateNoRequest,
        driverType: resultModel.driverType,
        companyId: resultModel.companyId,
        authToken: resultModel.auth_token,
        refreshToken: resultModel.refresh_token,
        loginAlert: resultModel.login_alert,
      };
      setUserModel(result);

      const isNeedTwoFAVerificationResponse =
        await checkIsNeedTwoFAVerification(result.id);
      const isNeedTwoFAVerification = isNeedTwoFAVerificationResponse.data;

      if (result.loginAlert !== '') {
        await showAlertAsync(translationString.alert, result.loginAlert);
      }

      if (isNeedTwoFAVerification) {
        const twoFAResponse = await checkIs2FASetup(result.id);
        const isUserSetup2FAResponse = twoFAResponse.data;

        if (isUserSetup2FAResponse) {
          setIsUserSetup2FA(isUserSetup2FAResponse);
        } else {
          const twoFADataResponse = await get2FAQRAndCode(result.id);

          setTwoFAInfo(twoFADataResponse.data);
        }

        setIs2FAPage(true);
      } else {
        console.log('callUserLoginApi', result);
        dispatch(createAction(ActionType.SET_USER_MODEL, result));
        dispatch(createAction(ActionType.LOGIN_RESET));
        AsyncStorage.setItem(Constants.ACCESS_TOKEN, result.authToken);
        AsyncStorage.setItem(Constants.REFRESH_TOKEN, result.refreshToken);
        AsyncStorage.setItem(Constants.USER_MODEL, JSON.stringify(result));
        AsyncStorage.setItem(Constants.LAST_JOB_SINCE, moment().format());
        setLoadingText(translationString.downloading);
        await initializeSignalR();
        callGetNextManifestDataApi(result);
        await checkPendingJobRequest();
      }
    } catch (err) {
      let errorModel = err.response.data;
      setAlertMsg(errorModel.errorMessage);
    } finally {
      setIsShowLoadingIndicator(false);
    }
  };

  const checkPendingJobRequest = async () => {
    fetchPendingJobRequests(1).then((response) => {
      setTimeout(() => {
        const showAlertMessage = response.data.total > 0;
        if (showAlertMessage) {
          Alert.alert(
            translationString.job_pending_title,
            translationString.job_pending_message,
            [
              {
                text: translationString.cancel,
                onPress: () => {},
              },
              {
                text: translationString.view,
                onPress: () => {
                  navigation.navigate('JobRequest');
                },
              },
            ],
          );
        }
      }, 10000);
    });
  };

  const verifyUser2FA = async (code) => {
    const response = await verify2FA(
      twoFAInfo.manualEntrySetupCode,
      code,
      isUserSetup2FA,
      userModel.id,
    );

    const isVerify = response.data;
    if (isVerify) {
      ToastMessageMultiLine({
        text1: translationString.verifySuccess,
        text1NumberOfLines: 2,
      });
      setTimeout(() => {
        redirectLoginUser();
      }, 1000);
    } else {
      ToastMessageErrorMultiLine({
        text1: translationString.verifyFail,
        text1NumberOfLines: 2,
      });
    }
  };

  const redirectLoginUser = async () => {
    dispatch(createAction(ActionType.SET_USER_MODEL, userModel));
    dispatch(createAction(ActionType.LOGIN_RESET));
    AsyncStorage.setItem(Constants.ACCESS_TOKEN, userModel.authToken);
    AsyncStorage.setItem(Constants.REFRESH_TOKEN, userModel.refreshToken);
    AsyncStorage.setItem(Constants.USER_MODEL, JSON.stringify(userModel));
    AsyncStorage.setItem(Constants.LAST_JOB_SINCE, moment().format());
    setLoadingText(translationString.downloading);
    console.log('redirectLoginUser', userModel);
    await initializeSignalR();
    callGetNextManifestDataApi(userModel);
    await checkPendingJobRequest();
  };

  const redirectBackToLoginPage = () => {
    setIs2FAPage(false);
    setTwoFAInfo({
      manualEntrySetupCode: '',
      qrCodeImageUrl: '',
    });
    setIsUserSetup2FA(false);
    setUserModel({});
  };

  const callRegeisterDeviceApi = async () => {
    try {
      const response = await regeisterDeviceApi();
      let resultModel = response.data;
    } catch (err) {
      let errorModel = err.response.data;
      setIsShowLoadingIndicator(false);
      setAlertMsg(errorModel.errorMessage);
    }
  };

  const usernameOnChangeText = (text) => {
    let payload = {
      username: text,
    };
    dispatch(createAction(ActionType.INPUT_USERNAME, payload));
  };

  const passwordOnchangeText = (text) => {
    let payload = {
      password: text,
    };
    dispatch(createAction(ActionType.INPUT_PASSWORD, payload));
  };

  const inputValidation = async () => {
    let errMsg = '';

    if (loginModel.username.length === 0) {
      errMsg = translationString.name_empty;
    } else if (loginModel.password.length === 0) {
      errMsg = translationString.password_empty;
    }

    if (errMsg.length > 0) {
      return GeneralHelper.showAlertMessage(errMsg);
    } else {
      if (networkModel.isConnected) {
        const response = await GeneralHelper.checkLocationPermission();
        //if location is not enable
        if (!response) {
          GeneralHelper.showAlertMessage(
            translationString.permission_location_rationale,
            async () => {
              let permissionResponse;
              if (Platform.OS === 'ios') {
                permissionResponse = await request(
                  PERMISSIONS.IOS.LOCATION_ALWAYS,
                );
              } else {
                permissionResponse = await request(
                  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                );
              }
              if (permissionResponse !== RESULTS.GRANTED) {
                GeneralHelper.openSetting();
              } else {
                AsyncStorage.setItem(Constants.IS_LOGGED_IN, 'true');
                setLoadingText(translationString.login_ing);
                setIsShowLoadingIndicator(true);
                callUserLoginApi();
              }
            },
          );
        } else {
          AsyncStorage.setItem(Constants.IS_LOGGED_IN, 'true');
          setLoadingText(translationString.login_ing);
          setIsShowLoadingIndicator(true);
          callUserLoginApi();
        }
      } else {
        setAlertMsg(translationString.no_internet_connection);
      }
    }
  };

  const requestResetPasswordEmail = (
    emailAddress,
    username,
    targetDomain,
    language,
  ) => {
    requestSendResetPasswordEmail(
      emailAddress,
      username,
      targetDomain,
      language,
    )
      .then(() => {
        setIsRequestResetPassword(true);
        ToastMessageMultiLine({
          text1: translationString.passwordResetEmailSuccess,
          text1NumberOfLines: 2,
        });
      })
      .catch(() => {
        setIsRequestResetPassword(false);
        ToastMessageErrorMultiLine({
          text1: translationString.passwordResetFail2,
          text1NumberOfLines: 2,
        });
      });
  };

  const gotoLanguageScreen = () => {
    navigation.navigate('Language');
  };

  const gotoRegisterScreen = () => {
    navigation.navigate('Register');
  };

  const gotoRequestResetPasswordScreen = () => {
    navigation.navigate('RequestResetPassword');
  };

  const gotoLoginScreen = () => {
    navigation.navigate('Login');
  };

  useEffect(() => {
    if (alertMsg) {
      setTimeout(() => {
        setAlertMsg('');
      }, 4000);
    }
  }, [alertMsg]);

  useEffect(() => {
    if (networkModel.isConnected) {
      callRegeisterDeviceApi();
    }
  }, [networkModel.isConnected]);

  useEffect(() => {
    if (epodRealm && epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      // Call any action
      // Orientation.unlockAllOrientations();
      // console.log('width', Dimensions.get('screen').width);

      // Orientation.lockToLandscape();
      // console.log('width', Dimensions.get('screen').width);

      Orientation.unlockAllOrientations();
      console.log('width', Dimensions.get('screen').width);

      Orientation.lockToPortrait();
      console.log('width', Dimensions.get('screen').width);

      setTimeout(() => {
        console.log('width-delay', Dimensions.get('screen').width);
        setWindowWidth(Dimensions.get('screen').width);
        setWindowHeight(Dimensions.get('screen').height);
      }, 1500);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const requestResetPasswordPhoneNumber = (
    phoneNumber,
    username,
    sendMethod,
    language,
  ) => {
    setIsShowLoadingIndicator(true);
    setLoadingText(translationString.sendingPasswordResetRequest);
    return requestResetPasswordWithPhoneNumber(
      phoneNumber,
      username,
      sendMethod,
      language,
    );
  };

  const requestNewVerificationCode = (
    phoneNumber,
    username,
    sendMethod,
    language,
  ) => {
    return requestNewOTP(phoneNumber, username, sendMethod, language);
  };

  const resetPasswordWithVerificationCode = (
    phoneNumber,
    username,
    otp,
    password,
    method,
    language,
  ) => {
    setIsShowLoadingIndicator(true);
    setLoadingText(translationString.resettingPassword2);
    return resetPasswordWithOTP(
      phoneNumber,
      username,
      otp,
      password,
      method,
      language,
    );
  };

  const directToAppLocation = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        if (Platform.OS === 'ios') {
          Linking.openURL(url).then(() => {
            RNExitApp.exitApp();
          });
        } else {
          BackHandler.exitApp();
          Linking.openURL(url);
        }
      }
    });
  };

  return {
    loginModel,
    networkModel,
    languageModel,
    isShowLoadingIndicator,
    alertMsg,
    loadingText,
    windowWidth,
    windowHeight,
    usernameOnChangeText,
    passwordOnchangeText,
    inputValidation,
    gotoLanguageScreen,
    gotoRegisterScreen,
    is2FAPage,
    twoFAInfo,
    isUserSetup2FA,
    verifyUser2FA,
    redirectBackToLoginPage,
    gotoRequestResetPasswordScreen,
    gotoLoginScreen,
    isRequestResetPassword,
    requestResetPasswordEmail,
    requestResetPasswordPhoneNumber,
    requestNewVerificationCode,
    resetPasswordWithVerificationCode,
    email,
    setEmail,
    setIsRequestResetPassword,
    setIsShowLoadingIndicator,
  };
};
