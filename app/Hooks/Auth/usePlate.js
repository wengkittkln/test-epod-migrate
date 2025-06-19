import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Alert} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {createAction} from '../../Actions/CreateActions';
import {useNetwork} from '../Network/useNetwork';
import * as Constants from '../../CommonConfig/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {translationString} from '../../Assets/translation/Translation';
import {IndexContext} from '../../Context/IndexContext';
import * as ActionType from '../../Actions/ActionTypes';

export const usePlate = (navigation) => {
  const {networkModel} = useNetwork();
  const userObject = useSelector((state) => state.UserReducer);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const {auth} = React.useContext(IndexContext);
  const [alertMsg, setAlertMsg] = useState('');
  const [plateNo, setPlateNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhoneNumber, setDriverPhoneNumber] = useState('');
  const dispatch = useDispatch();

  const plateNoOnChangeText = (text) => {
    setPlateNo(text);
  };

  const driverNameOnChangeText = (text) => {
    setDriverName(text);
  };

  const phoneNumberOnChangeText = (text) => {
    setDriverPhoneNumber(text);
  };

  const submitButtonOnClick = () => {
    if (
      !driverName &&
      userObject.driverType === Constants.DRIVER_TYPE.SUBCONTRACTOR
    ) {
      Alert.alert(translationString.plate_error_message);
      return;
    }
    const userModel = {
      ...userObject,
      truckNo: plateNo,
      name: driverName || userObject.name,
      phoneNumber: driverPhoneNumber,
    };
    AsyncStorage.setItem(Constants.USER_MODEL, JSON.stringify(userModel));
    dispatch(createAction(ActionType.SET_USER_MODEL, userModel));

    if (networkModel.isConnected) {
      setIsShowLoadingIndicator(true);
      const infoModel = {
        plateNo,
        driverName,
        driverPhoneNumber,
      };
      AsyncStorage.setItem(Constants.PLATE_NO, JSON.stringify(infoModel));
      auth.loginWithOrder();
      setIsShowLoadingIndicator(false);
    } else {
      setAlertMsg(translationString.no_internet_connection);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: translationString.plate_no,
      headerTitleStyle: {
        fontSize: 20,
        fontFamily: Constants.fontFamily,
        fontWeight: '500',
      },
      headerTintColor: Constants.WHITE,
      headerStyle: {
        backgroundColor: Constants.THEME_COLOR,
      },
    });
  }, [navigation]);

  useEffect(() => {
    if (alertMsg) {
      setTimeout(() => {
        setAlertMsg('');
      }, 4000);
    }
  }, [alertMsg]);

  useEffect(() => {
    //set default value plate number
    AsyncStorage.getItem(Constants.USER_MODEL).then((res) => {
      if (res) {
        let userModel = JSON.parse(res);
        if (userModel) {
          if (userModel.truckNo) {
            setPlateNo(userModel.truckNo);
          }
        }
      }
    });

    AsyncStorage.getItem(Constants.PLATE_NO).then((res) => {
      console.log(res);
      if (res) {
        const infoModel = JSON.parse(res);
        if (infoModel && infoModel.plateNo && infoModel.plateNo.length > 0) {
          auth.loginWithOrder();
        }
      }
    });
  }, []);

  return {
    alertMsg,
    isShowLoadingIndicator,
    plateNo,
    plateNoOnChangeText,
    submitButtonOnClick,
    driverNameOnChangeText,
    phoneNumberOnChangeText,
    driverName,
    driverPhoneNumber,
  };
};
