import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {translationString} from '../../Assets/translation/Translation';
import {useNetwork} from '../Network/useNetwork';
import * as ActionType from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';
import {TouchableOpacity, Image} from 'react-native';
import BackButton from '../../Assets/image/icon_back_white.png';
import * as Constants from '../../CommonConfig/Constants';
import {userRegisterApi} from '../../ApiController/ApiController';

export const useRegister = (navigation) => {
  const {networkModel} = useNetwork();
  const registerModel = useSelector((state) => state.RegisterReducer);
  const dispatch = useDispatch();

  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const usernameOnChangeText = (text) => {
    let payload = {
      username: text,
    };
    dispatch(createAction(ActionType.INPUT_REGISTER_USERNAME, payload));
  };

  const nameOnChangeText = (text) => {
    let payload = {
      name: text,
    };
    dispatch(createAction(ActionType.INPUT_NAME, payload));
  };

  const passwordOnChangeText = (text) => {
    let payload = {
      password: text,
    };
    dispatch(createAction(ActionType.INPUT_REGISTER_PASSWORD, payload));
  };

  const confirmPasswordOnChangeText = (text) => {
    let payload = {
      confirmPassword: text,
    };
    dispatch(createAction(ActionType.INPUT_CONFIRM_PASSWORD, payload));
  };

  const emailOnChangeText = (text) => {
    let payload = {
      email: text,
    };
    dispatch(createAction(ActionType.INPUT_EMAIL, payload));
  };

  const phoneNoOnChangeText = (text) => {
    let payload = {
      phoneNo: text,
    };
    dispatch(createAction(ActionType.INPUT_PHONE_NO, payload));
  };

  const companyOnChangeText = (text) => {
    let payload = {
      company: text,
    };
    dispatch(createAction(ActionType.INPUT_COMAPANY, payload));
  };

  const inputValidationRegister = async () => {
    let errMsg = '';
    const emailRegex = new RegExp(
      '^[\\w-]+[\\w-.]?@[\\w-]+(\\.[A-Za-z]{2,5})+$',
      'gi',
    );
    const companyRegex = new RegExp('[^0-9a-zA-Z]', 'gi');

    if (registerModel.username.length === 0) {
      errMsg = translationString.name_empty;
    } else if (registerModel.name.length === 0) {
      errMsg = translationString.username_empty;
    } else if (registerModel.password.length === 0) {
      errMsg = translationString.password_empty;
    } else if (!checkPasswordFulfillRequirement(registerModel.password)) {
      errMsg = translationString.passwordNoFulfillRequirement;
    } else if (registerModel.confirmPassword.length === 0) {
      errMsg = translationString.password_confirm_empty;
    } else if (registerModel.password != registerModel.confirmPassword) {
      errMsg = translationString.password_confirm_error;
    } else if (
      registerModel.email.length > 0 &&
      emailRegex.test(registerModel.email) != true
    ) {
      errMsg = translationString.email_invalid;
    } else if (registerModel.company.length === 0) {
      errMsg = translationString.company_empty;
    } else if (companyRegex.test(registerModel.company)) {
      errMsg = translationString.company_invalid;
    }

    if (errMsg.length > 0) {
      return GeneralHelper.showAlertMessage(errMsg);
    } else {
      if (networkModel.isConnected) {
        setIsShowLoadingIndicator(true);

        await callUserRegisterApi();
      } else {
        setAlertMsg(translationString.no_internet_connection);
      }
    }
  };

  const checkPasswordFulfillRequirement = (password) => {
    if (!password) {
      return false;
    }

    return (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&#]/.test(password)
    );
  };

  const callUserRegisterApi = async () => {
    try {
      const response = await userRegisterApi(registerModel);

      setIsShowLoadingIndicator(false);
      setAlertMsg(translationString.register_success);
      setTimeout(() => {
        navigation.goBack();
      }, 300);

      dispatch(createAction(ActionType.REGISTER_RESET));
    } catch (err) {
      let errorModel = err.response.data;
      setIsShowLoadingIndicator(false);

      setAlertMsg(errorModel.errorMessage);
    }
  };

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
    alertMsg,
    registerModel,
    isShowLoadingIndicator,
    usernameOnChangeText,
    nameOnChangeText,
    passwordOnChangeText,
    confirmPasswordOnChangeText,
    emailOnChangeText,
    phoneNoOnChangeText,
    companyOnChangeText,
    inputValidationRegister,
  };
};
