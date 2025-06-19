import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {translationString} from '../../Assets/translation/Translation';
import {IndexContext} from '../../Context/IndexContext';
import {useNetwork} from '../Network/useNetwork';
import * as ActionType from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';
import {TouchableOpacity, Image} from 'react-native';
import BackButton from '../../Assets/image/icon_back_white.png';
import * as Constants from '../../CommonConfig/Constants';
import {getUserInfo, activeUserApi} from '../../ApiController/ApiController';

export const useUserInfo = (route, navigation) => {
  const companyArg = route.params.companyId ? route.params.companyId : 0;
  const partyArg =
    route.params.partyCode && route.params.partyCode.length > 0
      ? route.params.partyCode
      : '';
  const nameArg = route.params.username;
  const manifestArg = route.params.manifestId ? route.params.manifestId : 0;
  const orderArg =
    route.params.orderNumber && route.params.orderNumber.length > 0
      ? route.params.orderNumber
      : '';

  const {networkModel} = useNetwork();
  const userInfoModel = useSelector((state) => state.RegisterUserInfoReducer);
  const dispatch = useDispatch();

  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [loadingText, setLoadingText] = useState('');

  const loading = translationString.loading2;
  const submit = translationString.submit;
  const [buttonText, setButtonText] = useState(loading);

  const nameOnChangeText = (text) => {
    let payload = {
      name: text,
    };
    dispatch(createAction(ActionType.INPUT_USERINFO_NAME, payload));
  };

  const phoneNoOnChangeText = (text) => {
    let payload = {
      phoneNumber: text,
    };
    dispatch(createAction(ActionType.INPUT_USERINFO_PHONE_NUMBER, payload));
  };

  const truckNoOnChangeText = (text) => {
    let payload = {
      truckNo: text,
    };
    dispatch(createAction(ActionType.INPUT_USERINFO_TRUCKNO, payload));
  };

  const companyNameOnChangeText = (text) => {
    let payload = {
      companyName: text,
    };
    dispatch(createAction(ActionType.INPUT_USERINFO_COMPANY, payload));
  };

  const inputValidationUserInfo = async () => {
    if (networkModel.isConnected) {
      setLoadingText(translationString.login_ing);
      setIsShowLoadingIndicator(true);

      await activationApi();
    } else {
      setAlertMsg(translationString.no_internet_connection);
    }
  };

  const activationApi = async () => {
    try {
      let params = {
        CompanyId: companyArg,
        PartyCode: partyArg,
        UserName: nameArg,
      };

      const response = await activeUserApi(params);
    } catch (err) {
      let errorModel = err.response.data;
      setAlertMsg(errorModel.errorMessage);
    }
  };

  const callUserInfoApi = async () => {
    let params = {
      CompanyId: companyArg,
      PartyCode: partyArg,
      UserName: nameArg,
    };

    try {
      const response = await getUserInfo(params);

      let resultModel = response.data;
      let userInfo = {
        name: resultModel.userName,
        phoneNumber: resultModel.phoneNumber,
        truckNo: resultModel.truckNo,
        companyName: resultModel.companyName,
      };

      let payload = {
        userInfo: userInfo,
      };

      dispatch(createAction(ActionType.UPDATE_USERINFO, payload));
      setButtonText(submit);
    } catch (err) {
      let errorModel = err.response.data;
      setAlertMsg(errorModel.errorMessage);
    }
  };

  useEffect(() => {
    callUserInfoApi();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            dispatch(createAction(ActionType.REGISTER_RESET));
            navigation.goBack();
          }}>
          <Image style={{tintColor: Constants.WHITE}} source={BackButton} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (alertMsg) {
      setTimeout(() => {
        setAlertMsg('');
      }, 4000);
    }
  }, [alertMsg]);

  return {
    buttonText,
    alertMsg,
    userInfoModel,
    nameOnChangeText,
    phoneNoOnChangeText,
    truckNoOnChangeText,
    companyNameOnChangeText,
    inputValidationUserInfo,
  };
};
