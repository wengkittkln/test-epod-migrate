/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';

export const useNetwork = () => {
  const networkModel = useSelector((state) => state.NetworkReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const payload = {
        isConnected: state.isConnected,
      };
      dispatch(createAction(ActionType.UPDATE_NETWORK_CONNECTION, payload));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {networkModel};
};
