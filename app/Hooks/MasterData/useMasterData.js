/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {createAction} from '../../Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';
import * as Constants from '../../CommonConfig/Constants';
import * as ManifestRealmManager from '../../Database/realmManager/ManifestRealmManager';
import * as MasterDataRealmManager from '../../Database/realmManager/MasterDataRealmManager';
import * as JobRealmManager from '../../Database/realmManager/JobRealmManager';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {
  getMasterDataApi,
  getMasterConfigurations,
} from '../../ApiController/ApiController';
import {IndexContext} from '../../Context/IndexContext';
import {ActionSyncContext} from '../../Context/ActionSyncContext';
import * as ConfigurationRealmManager from '../../Database/realmManager/ConfigurationRealmManager';

export const useMasterData = () => {
  const joblistModel = useSelector((state) => state.JobListReducer);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const dispatch = useDispatch();
  const {auth, manifestData, masterData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);
  const actionSyncContext = React.useContext(ActionSyncContext);

  const getAllMasterData = async () => {
    try {
      let masterDataList = MasterDataRealmManager.queryAllMasterData(epodRealm);
      EpodRealmHelper.updateMasterData(masterDataList);
    } catch (error) {
      alert('Get MAster Data error: ' + error);
    }
  };

  const getMasterDataById = async (masterDataModel, index, lastIndex) => {
    try {
      let result = MasterDataRealmManager.getMasterDataById(
        masterDataModel,
        epodRealm,
      );
      if (result) {
        updateMasterData(masterDataModel, index, lastIndex);
      } else {
        insertMasterData(masterDataModel, index, lastIndex);
      }
    } catch (error) {
      alert('get master data by id: ' + error);
    }
  };

  const insertMasterData = async (masterDataModel, index, lastIndex) => {
    try {
      MasterDataRealmManager.insertNewMasterData(masterDataModel, epodRealm);

      if (index === lastIndex) {
        getAllMasterData();
      }
    } catch (error) {
      alert('inssert master data: ' + error);
    }
  };

  const updateMasterData = async (masterDataModel, index, lastIndex) => {
    try {
      MasterDataRealmManager.updateMasterData(masterDataModel, epodRealm);

      if (index === lastIndex) {
        getAllMasterData();
      }
    } catch (error) {
      alert('update master data: ' + error);
    }
  };

  const callGetMasterDataApi = async () => {
    try {
      const response = await getMasterDataApi(manifestData.id);
      let resultModel = response.data;
      let joblist = JobRealmManager.queryAllJobsData(epodRealm);
      let newJobList = [];

      joblist.map((item) => {
        let jobModel = GeneralHelper.convertRealmObjectToJSON(item);
        let selectedCustomerList = resultModel.filter(function (masterData) {
          return masterData.id === item.customerId;
        });
        if (selectedCustomerList.length) {
          let selectedCustomerModel = selectedCustomerList[0];
          jobModel.customer = selectedCustomerModel;
          try {
            JobRealmManager.updateCustomerByJobId(
              item.id,
              selectedCustomerModel,
              epodRealm,
            );
          } catch (error) {
            console.log(error);
            alert('update customer in job error: ', error);
          }
        }
        newJobList.push(jobModel);
      });

      try {
        const configResponse = await getMasterConfigurations();

        if (
          configResponse &&
          configResponse.data &&
          configResponse.data.length > 0
        ) {
          for (var i of configResponse.data) {
            ConfigurationRealmManager.insertNewData(epodRealm, i);
          }
        }
      } catch (ex) {}

      let payload = {
        isRefresh: true,
      };
      dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));

      let updateManifestModel =
        await ManifestRealmManager.geManifestByManifestId(
          manifestData,
          epodRealm,
        )[0];
      updateManifestModel.jobs = newJobList;

      ManifestRealmManager.updateManifestData(updateManifestModel, epodRealm);
      EpodRealmHelper.updateManifestData(updateManifestModel);
    } catch (err) {
      if (
        err.refreshErrorMsg &&
        err.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
      ) {
        auth.setIsExpiredToken();
        if (actionSyncContext !== null) {
          actionSyncContext.showLoginModal();
        }
      }
    }
  };

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

  useEffect(() => {
    async function fetchData() {
      if (manifestData.id) {
        if (networkModel.isConnected) {
          await callGetMasterDataApi();
        } else {
          getAllMasterData();
        }
      }
    }

    fetchData();
  }, [manifestData.id, networkModel.isConnected]);

  return {
    callGetMasterDataApi,
  };
};
