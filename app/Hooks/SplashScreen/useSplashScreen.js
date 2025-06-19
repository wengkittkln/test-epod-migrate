/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Animated} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAction} from '../../Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as Constants from '../../CommonConfig/Constants';
import moment from 'moment';
import {translationString} from '../../Assets/translation/Translation';

export const useSplashScreen = (navigation) => {
  const opacity = useState(new Animated.Value(0))[0];
  const dispatch = useDispatch();
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(Constants.USER_MODEL).then((res) => {
      if (res) {
        let userModel = JSON.parse(res);
        dispatch(createAction(ActionType.SET_USER_MODEL, userModel));
      }
    });

    AsyncStorage.getItem(Constants.LAST_DElTA_SYNC_TIME).then((res) => {
      let tempLastSyncDate = moment().utc().format('YYYY-MM-DD HH:mm:ss');
      if (res && res !== '') {
        tempLastSyncDate = res;
      }

      let payload = {
        lastSyncDate: tempLastSyncDate,
      };
      dispatch(createAction(ActionType.UPDATE_LAST_SYNC_DATE, payload));
    });

    AsyncStorage.getItem(Constants.LANGUAGE).then((res) => {
      if (res) {
        const languageModel = JSON.parse(res);
        const payload = languageModel;
        dispatch(createAction(ActionType.UPDATE_LANGUAGE, payload));
        translationString.setLanguage(languageModel.code);
      } else {
        translationString.setLanguage('zh-Hant');
      }
    });
    AsyncStorage.setItem(Constants.IS_REFRESH, 'N');
  }, []);

  return {opacity};
};
