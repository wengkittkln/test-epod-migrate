/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Button, Alert} from 'react-native';
import moment from 'moment';
import * as Constants from '../../CommonConfig/Constants';
import * as ActionType from '../../Actions/ActionTypes';
import * as ManifestRealmManager from '../../Database/realmManager/ManifestRealmManager';
import * as CustomerRealmManager from '../../Database/realmManager/CustomerRealmManager';
import * as JobRealmManager from '../../Database/realmManager/JobRealmManager';
import {getDeltaSyncDataApi} from '../../ApiController/ApiController';
import {IndexContext} from '../../Context/IndexContext';
import {useSelector, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAction} from '../../Actions/CreateActions';
import {useNetwork} from '../../Hooks/Network/useNetwork';
import {ActionSyncContext} from '../../Context/ActionSyncContext';
import BackgroundTimer from 'react-native-background-timer';
import {addEventLog} from '../../Helper/AnalyticHelper';
import * as ActionRealmManager from '../../Database/realmManager/ActionRealmManager';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {translationString} from '../../Assets/translation/Translation';
import * as JobTransferRealmManager from '../../Database/realmManager/JobTransferRealmManager';
import * as ShopsRealmManager from '../../Database/realmManager/ShopsRealmManager';
import {UploadDatabaseService} from '../../Database/UploadDatabaseService';
import {useLocation} from '../../Hooks/Location/useLocation';

export const useDeltaSync = (callGetMasterDataApi, initiateFrom) => {
  const deltaSyncInitiateFrom = useRef(initiateFrom);
  const {networkModel} = useNetwork();
  const [timeOutFlag, setTimeOutFlag] = useState(true);
  const manifestReducerModel = useSelector((state) => state.ManifestReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const {auth, manifestData, masterData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);
  const actionSyncContext = React.useContext(ActionSyncContext);
  const dispatch = useDispatch();
  const {uploadDatabase} = UploadDatabaseService();
  const [isDeltaSyncLoading, setIsDeltaSyncLoading] = useState(false);
  const {setGPSTracking} = useLocation();

  const checkingForNewCutomer = (newCustomerIDList, newJobModel) => {
    let customerID = newJobModel.customerId;

    try {
      let result = CustomerRealmManager.getCustomerDataById(
        customerID,
        epodRealm,
      );
      if (result) {
      } else {
        newCustomerIDList.push(customerID);
      }
    } catch (error) {
      alert('get Customer id error; ' + error);
    }
  };

  const checkingIfCustomerExist = async (customerIds) => {
    const newCustomerIds = customerIds.map((e) => {
      try {
        const result = CustomerRealmManager.getCustomerDataById(e, epodRealm);
        if (!result) {
          return e;
        }
      } catch (error) {
        console.log('get Customer id error; ' + error);
      }
    });
    if (
      newCustomerIds &&
      newCustomerIds.length > 0 &&
      networkModel.isConnected
    ) {
      await callGetMasterDataApi();
    }
  };

  const checkingForUpdateLocalDb = async (jobs) => {
    let isUpdated = false;
    let hasNewJobs = false;

    for (let job of jobs) {
      const localJob = JobRealmManager.getJobByJobId(job.id, epodRealm);
      if (!localJob) {
        if (manifestData.isForcedSequencing) {
          job.sequence = -1;
        }
        // new job: current job id not found in local db
        const customer = CustomerRealmManager.getCustomerDataById(
          job.customerId,
          epodRealm,
        );
        if (customer) {
          job = {...job, customer};
        }
        isUpdated = true;
        hasNewJobs = true;

        if (job.shop && job.shopId) {
          var localShop = ShopsRealmManager.selectShopById(
            epodRealm,
            job.shopId,
          );
          if (localShop) {
            job.shop = null;
          }
        }

        JobRealmManager.insertNewJob(job, epodRealm);
      } else {
        //existing job
        const actionsByJob =
          await ActionRealmManager.getAllPendingActionByJobId(
            Constants.SyncStatus.SYNC_PENDING,
            job.id,
            epodRealm,
          );

        let selectedJob = GeneralHelper.convertRealmObjectToJSON(localJob);
        if (selectedJob.isRemoved !== job.isRemoved) {
          isUpdated = true;
        }
        if (actionsByJob && actionsByJob.length === 0) {
          // all actions are synced, use server status as the latest (rollback action will handle here)
          selectedJob.pendingStatus = job.status;
          selectedJob.status = job.status;
          selectedJob.currentStep = job.currentStep;
          selectedJob.currentStepCode = job.currentStep + 1;
          selectedJob.podTime = job.podTime;
          selectedJob.reasonDescription = job.reasonDescription;
          selectedJob.isRemoved = job.isRemoved;
          selectedJob.tags = job.tags;
        } else if (job.currentStep + 1 > selectedJob.currentStepCode) {
          // pending actions not yet synced  and server step > current local step, use server data as latest
          selectedJob.pendingStatus = job.status;
          selectedJob.status = job.status;
          selectedJob.currentStep = job.currentStep;
          selectedJob.currentStepCode = job.currentStep + 1;
          selectedJob.podTime = job.podTime;
          selectedJob.reasonDescription = job.reasonDescription;
          selectedJob.isRemoved = job.isRemoved;
          selectedJob.tags = job.tags;
        } else {
          // do nothing if local data is latest
          selectedJob.isRemoved = job.isRemoved;
        }
        selectedJob.jobPassword = job.jobPassword;
        selectedJob.latestETA = job.latestETA;
        selectedJob.isLocked = job.isLocked;
        selectedJob.destination = job.destination;
        selectedJob.consignee = job.consignee;
        selectedJob.contact = job.contact;
        selectedJob.remark = job.remark;
        JobRealmManager.updateJobData(selectedJob, epodRealm);

        if (job.shop && job.shopId) {
          var localShop = ShopsRealmManager.selectShopById(
            epodRealm,
            job.shopId,
          );
          if (!localShop) {
            ShopsRealmManager.insertNewData(epodRealm, job.shop);
          } else {
            ShopsRealmManager.updateShop(epodRealm, job.shop, job.shopId);
          }
        }
      }
    }

    // If there are new jobs under the same manifest, turn on GPS tracking
    if (hasNewJobs) {
      console.log('Call from delta sync');
      setGPSTracking(true);
    }

    return isUpdated;
  };

  const updateManifestData = async (manifestModel) => {
    try {
      ManifestRealmManager.updateManifestData(manifestModel, epodRealm);
      await EpodRealmHelper.updateManifestData(manifestModel);
    } catch (error) {
      alert('update manifest error: ' + error);
    }
  };

  //isMultipleAlert
  const callGetDeltaSyncApi = async () => {
    if (!networkModel.isConnected) {
      return;
    }

    return AsyncStorage.getItem(Constants.LAST_DElTA_SYNC_TIME).then(
      async (res) => {
        let isUpdated = false;
        const currentDate = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        let tempLastSyncDate = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        if (res && res !== '') {
          tempLastSyncDate = res;
        }

        const payload = {
          lastSyncDate: tempLastSyncDate,
        };
        dispatch(createAction(ActionType.UPDATE_LAST_SYNC_DATE, payload));

        addEventLog('sync_api_triggered', {
          syncapitriggered: `${
            userModel.id
          }, lastsyncdate: ${res}, operateAt: ${moment().format(
            'YYYY-MM-DD HH:mm:ss',
          )}`,
        });
        console.log('LAST_DElTA_SYNC_TIME', res);
        try {
          const response = await getDeltaSyncDataApi(
            manifestData.id,
            res ? res : manifestReducerModel.lastSyncDate,
            manifestData.isForcedSequencing,
          );

          AsyncStorage.setItem(Constants.LAST_DElTA_SYNC_TIME, currentDate);

          let resultModel = response.data;
          const responseJobList = resultModel.jobs;
          if (responseJobList.length) {
            isUpdated = await checkingForUpdateLocalDb(resultModel.jobs);
            // resultModel.jobs = newJobList;

            if (resultModel.orders.length) {
              let newOrderList = manifestData.orders.concat(resultModel.orders);
              resultModel.orders = newOrderList;
            }
            if (resultModel.orderItems.length) {
              let newOrderItemList = manifestData.orderItems.concat(
                resultModel.orderItems,
              );
              resultModel.orderItems = newOrderItemList;
            }
            // check customer
            const customerIds = responseJobList.map((e) => e.customerId);
            checkingIfCustomerExist(customerIds);
          }

          let manifests = ManifestRealmManager.queryAllManifestData(epodRealm);
          if (manifests && manifests.length > 0) {
            let manifestInfo = GeneralHelper.convertRealmObjectToJSON(
              manifests[0],
            );
            manifestInfo.orders = resultModel.orders;
            manifestInfo.orderItems = resultModel.orderItems;
            manifestInfo.jobContainers = resultModel.jobContainers;
            if (!resultModel.jobContainers) {
              manifestInfo.jobContainers = [];
            }
            manifestInfo.sequencedStatus = resultModel.sequencedStatus;
            manifestInfo.sequencedCount = resultModel.sequencedCount;
            manifestInfo.sequenceLimit = resultModel.sequenceLimit;
            manifestInfo.isForcedSequencing = resultModel.isForcedSequencing;
              manifestInfo.userId = resultModel.userId;

            // console.log('sequencedStatus', resultModel.sequencedStatus);
            // console.log(
            //   'resultModel.isForcedSequencing',
            //   resultModel.isForcedSequencing,
            // );
            // if (isUpdated) {
            //   const isForcedSequencing =
            //     JobRealmManager.getIsForcedSequencing(epodRealm);
            //   manifestInfo.isForcedSequencing = isForcedSequencing;
            // }
            updateManifestData(manifestInfo);

            if (resultModel.isForceDbUpload) {
              uploadDatabase(false, manifestInfo.id);
            }
          }

          insertOrUpdateJobTransfer(resultModel);

          const isRefresh =
            (await AsyncStorage.getItem(Constants.IS_REFRESH)) ?? 'N';

          if (isUpdated && isRefresh === 'N') {
            AsyncStorage.setItem(Constants.IS_REFRESH, 'Y');
            setIsDeltaSyncLoading(false);
            Alert.alert(
              translationString.alert,
              translationString.manifest_has_been_updated,
              [
                {
                  text: translationString.confirm,
                  onPress: () => {
                    AsyncStorage.setItem(Constants.IS_REFRESH, 'N');
                  },
                },
              ],
            );
          }
        } catch (err) {
          console.log('err', err);
          if (
            err.refreshErrorMsg &&
            err.refreshErrorMsg === Constants.REFRESH_TOKEN_FAILED
          ) {
            auth.setIsExpiredToken();
            if (actionSyncContext !== null) {
              actionSyncContext.showLoginModal();
            }
          }
        } finally {
          setIsDeltaSyncLoading(false);
        }
      },
    );
  };

  const callGetDeltaWithArg = async (manifestModel) => {
    return AsyncStorage.getItem(Constants.LAST_DElTA_SYNC_TIME).then(
      async (res) => {
        let isUpdated = false;
        if (manifestModel.id) {
          let tempLastSyncDate = moment().utc().format('YYYY-MM-DD HH:mm:ss');
          if (res && res !== '') {
            tempLastSyncDate = res;
          }
          const payload = {
            lastSyncDate: tempLastSyncDate,
          };
          dispatch(createAction(ActionType.UPDATE_LAST_SYNC_DATE, payload));

          // if (res) {
          //   let payload = {
          //     lastSyncDate: res,
          //   };
          //   dispatch(createAction(ActionType.UPDATE_LAST_SYNC_DATE, payload));
          // }
          const syncDate = moment().utc().format('YYYY-MM-DD HH:mm:ss');
          addEventLog('sync_api_login', {
            user: `${userModel.id}, operateAt: ${moment().format(
              'YYYY-MM-DD HH:mm:ss',
            )}`,
          });
          try {
            const response = await getDeltaSyncDataApi(
              manifestModel.id,
              syncDate,
              manifestData.isForcedSequencing,
            );
            let resultModel = response.data;
            const responseJobList = resultModel.jobs;
            AsyncStorage.setItem(
              Constants.LAST_DElTA_SYNC_TIME,
              moment().utc().format('YYYY-MM-DD HH:mm:ss'),
            );

            if (resultModel.jobs.length) {
              isUpdated = checkingForUpdateLocalDb(resultModel.jobs);
            }

            if (resultModel.orders.length) {
              let newOrderList = manifestModel.orders.concat(
                resultModel.orders,
              );
              resultModel.orders = newOrderList;
            }

            if (resultModel.orderItems.length) {
              let newOrderItemList = manifestModel.orderItems.concat(
                resultModel.orderItems,
              );
              resultModel.orderItems = newOrderItemList;
            }

            if (resultModel.jobContainers.length) {
              let newJobContainers = manifestModel.jobContainers.concat(
                resultModel.jobContainers,
              );
              resultModel.jobContainers = newJobContainers;
            }

            updateManifestData(resultModel);
            insertOrUpdateJobTransfer(resultModel);

            updateManifestData(resultModel);
            return responseJobList;
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
        }
      },
    );
  };

  const insertOrUpdateJobTransfer = async (resultModel) => {
    try {
      const jobTransferList = resultModel.jobTransferList;
      if (jobTransferList && jobTransferList.length > 0) {
        for (var i of jobTransferList) {
          const isExist =
            await JobTransferRealmManager.getPendingJobTransferById(
              i.id,
              epodRealm,
            );

          if (!isExist) {
            JobTransferRealmManager.insertNewItem(i, epodRealm);
          } else {
            JobTransferRealmManager.updateJobTransfer(epodRealm, i);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   BackgroundTimer.start();
  //   const intervalId = BackgroundTimer.setInterval(() => {
  //     if (networkModel.isConnected) {
  //       if (manifestData.id) {
  //         callGetDeltaSyncApi();
  //       }
  //     }
  //   }, 120000);
  //   BackgroundTimer.stop();

  //   return () => BackgroundTimer.clearInterval(intervalId);
  // }, [manifestData.id, networkModel.isConnected, timeOutFlag]);

  useEffect(() => {
    const fetchData = async () => {
      const isAllowRunDeltaSync =
        deltaSyncInitiateFrom.current ===
        manifestData?.marketDateUpdateLocation;

      if (manifestData?.marketDateUpdate && isAllowRunDeltaSync) {
        setIsDeltaSyncLoading(true);
        await callGetDeltaSyncApi();
        setIsDeltaSyncLoading(false);
      }
    };

    fetchData();
  }, [manifestData?.marketDateUpdate]);

  return {
    isDeltaSyncLoading,
    networkModel,
    callGetDeltaSyncApi,
    callGetDeltaWithArg,
  };
};
