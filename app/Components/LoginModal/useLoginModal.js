/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import {IndexContext} from '../../Context/IndexContext';
import {useSelector, useDispatch} from 'react-redux';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {createAction} from '../../Actions/CreateActions';
import * as ActionType from '../../Actions/ActionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  userLoginApi,
  resetIsRefreshingApiConfig,
} from '../../ApiController/ApiController';

export const useLoginModal = (item) => {
  const loginModalModel = useSelector((state) => state.LoginModalReducer);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [contentHeight, setContentHeight] = useState(320);
  const {auth} = React.useContext(IndexContext);

  const callUserLoginApi = async () => {
    try {
      const loginModel = {
        username: userModel.username,
        password: password,
      };
      const response = await userLoginApi(loginModel);
      let resultModel = response.data;
      let tempUserModel = {
        id: resultModel.id,
        name: resultModel.name,
        truckNo: resultModel.truckNo,
        phoneNumber: resultModel.phoneNumber,
        username: loginModel.username,
      };
      dispatch(createAction(ActionType.SET_USER_MODEL, tempUserModel));
      AsyncStorage.setItem(Constants.ACCESS_TOKEN, resultModel.auth_token);
      AsyncStorage.setItem(Constants.REFRESH_TOKEN, resultModel.refresh_token);
      AsyncStorage.setItem(Constants.USER_MODEL, JSON.stringify(userModel));
      auth.loginWithOrder();
      setIsShowLoadingIndicator(false);
      dismissLoginModal();
    } catch (err) {
      let errorModel = err.response.data;
      setIsShowLoadingIndicator(false);
      setAlertMsg(errorModel.errorMessage);
    }
  };

  const dismissLoginModal = () => {
    const payload = {
      isShowLoginModal: false,
    };
    resetIsRefreshingApiConfig();
    dispatch(createAction(ActionType.SET_IS_SHOW_LOGIN_MODAL, payload));
    setPassword('');
  };

  const loginButtonOnPress = () => {
    let errMsg = '';
    if (password.length === 0) {
      errMsg = translationString.password_empty;
    }

    if (errMsg.length > 0) {
      return GeneralHelper.showAlertMessage(errMsg);
    } else {
      if (networkModel.isConnected) {
        setLoadingText(translationString.login_ing);
        setIsShowLoadingIndicator(true);
        callUserLoginApi();
      } else {
        setAlertMsg(translationString.no_internet_connection);
      }
    }
  };

  useEffect(() => {
    if (alertMsg) {
      setTimeout(() => {
        setAlertMsg('');
      }, 4000);
    }
  }, [alertMsg]);

  return {
    dismissLoginModal,
    loginButtonOnPress,
    setPassword,
    setContentHeight,
    userModel,
    password,
    alertMsg,
    isShowLoadingIndicator,
    loadingText,
    contentHeight,
  };
};
