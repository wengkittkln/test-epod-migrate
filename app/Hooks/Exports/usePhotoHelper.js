/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {IndexContext} from '../../Context/IndexContext';
import * as ApiController from '../../ApiController/ApiController';
import * as Constants from '../../CommonConfig/Constants';
import * as ActionRealmManager from '../../Database/realmManager/ActionRealmManager';
import * as ActionOrderItemRealmManager from '../../Database/realmManager/ActionOrderItemRealmManager';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as ActionHelper from '../../Helper/ActionHelper';
import * as PhotoHelper from '../../Helper/PhotoHelper';
import * as ActionType from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';
import {useRefreshTokenLogin} from '../RefreshTokenLogin/useRefreshTokenLogin';
import {addEventLog} from '../../Helper/AnalyticHelper';

export const usePhotoHelper = () => {
  const networkModel = useSelector((state) => state.NetworkReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const {auth, epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const {showLoginModal} = useRefreshTokenLogin();

  const getAllImagePatch = async () => {
    return await PhotoHelper.getAllPhoto(epodRealm);
  };

  // const deletePreviousExportedPhotos = async (take, groupName) => {
  //   return await PhotoHelper.deletePreviousExportedPhoto(
  //       take,
  //       groupName
  //   );

  // };

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

  return {
    getAllImagePatch,
    // deletePreviousExportedPhotos,
  };
};
