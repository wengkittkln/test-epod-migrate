/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {createAction} from '../../Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';

export const useRefreshTokenLogin = () => {
  const dispatch = useDispatch();

  const showLoginModal = () => {
    const payload = {
      isShowLoginModal: true,
    };
    dispatch(createAction(ActionType.SET_IS_SHOW_LOGIN_MODAL, payload));
  };

  return {showLoginModal};
};
