import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAction} from '../../Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import BackButton from '../../Assets/image/icon_back_white.png';
import {IndexContext} from '../../Context/IndexContext';

export const useSelectLanguage = (navigation) => {
  const languageModel = useSelector((state) => state.LanguageReducer);
  const dispatch = useDispatch();
  const {authState} = React.useContext(IndexContext);

  const itemOnSelect = (item) => {
    let payload = item;
    translationString.setLanguage(item.code);
    dispatch(createAction(ActionType.UPDATE_LANGUAGE, payload));
    AsyncStorage.setItem(Constants.LANGUAGE, JSON.stringify(item));
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image
            style={{tintColor: authState.isLogin ? Constants.WHITE : 'black'}}
            source={BackButton}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return {
    languageModel,
    itemOnSelect,
  };
};
