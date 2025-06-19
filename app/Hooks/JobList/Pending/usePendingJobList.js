/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect, useRef} from 'react';
import {createAction} from '../../../Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../../Actions/ActionTypes';
import * as Constants from '../../../CommonConfig/Constants';
import * as JobRealmManager from '../../../Database/realmManager/JobRealmManager';
import * as JobSortRealmManager from '../../../Database/realmManager/JobSortRealmManager';
import * as GeneralHelper from '../../../Helper/GeneralHelper';
import {translationString} from '../../../Assets/translation/Translation';
import {IndexContext} from '../../../Context/IndexContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {useActionSync} from '../../../Hooks/ActionSync/useActionSync';
import {useMasterData} from '../../../Hooks/MasterData/useMasterData';
import {useDeltaSync} from '../../../Hooks/DeltaSync/useDeltaSync';
import Logout from '../../../Components/Logout';
import * as ManifestRealmManager from '../../../Database/realmManager/ManifestRealmManager';
import {useLocation} from '../../../Hooks/Location/useLocation';

export const usePendingJobList = (route, navigation) => {
  const networkModel = useSelector((state) => state.NetworkReducer);
  const joblistModel = useSelector((state) => state.JobListReducer);
  const languageModel = useSelector((state) => state.LanguageReducer);
  const loginModalModel = useSelector((state) => state.LoginModalReducer);
  const userModel = useSelector((state) => state.UserReducer);

  const dispatch = useDispatch();
  const {
    auth,
    authState,
    manifestData,
    masterData,
    epodRealm,
    EpodRealmHelper,
  } = React.useContext(IndexContext);
  const {
    callActionSyncApi,
    getAllPendingAction,
    updateActionSyncLock,
    updateActionsSyncLockToPending,
    syncPhoto,
  } = useActionSync();
  const {callGetMasterDataApi} = useMasterData();
  const {callGetDeltaSyncApi} = useDeltaSync(
    callGetMasterDataApi,
    'usePendingJobList',
  );
  const {setGPSTracking} = useLocation();

  //YX: temp hide ot
  // const {callGetMasterDataApi} = useMasterData();
  // const {networkModel, lastSynDateModel} = useDeltaSync(callGetMasterDataApi);
  const [datalist, setDataList] = useState([]);
  const originalDataListRef = useRef([]);
  const [normalSortOption, setNormalSortOption] = useState('');
  const [vipSortOption, setVipSortOption] = useState('');

  const getPendingJobList = () => {
    let localPendingJobList = [];
    let tempDataList = [];
    switch (joblistModel.filterType) {
      case Constants.JobType.DELIVERY:
      case Constants.JobType.PICK_UP:
        localPendingJobList =
          JobRealmManager.getAllJobByStatusJobTypeSortByDescStatusAscSeqAscTime(
            epodRealm,
            Constants.JobStatus.IN_PROGRESS,
            joblistModel.filterType,
          );
        break;
      default:
        //All
        localPendingJobList =
          JobRealmManager.getAllJobByStatusSortByDescStatusAscSeqAscTime(
            epodRealm,
            Constants.JobStatus.IN_PROGRESS,
          );
        break;
    }

    localPendingJobList.map((item) => {
      let jobModel = GeneralHelper.convertRealmObjectToJSON(item);
      tempDataList.push(jobModel);
      //console.log(jobModel.isLocked);
    });
    // setDataList(tempDataList); Set datalist moved to compiledJobList()
    originalDataListRef.current = [...tempDataList];
    compiledJobList();

    if (authState.isLogin && tempDataList.length > 0) {
      console.log('Call from pending job list');
      setGPSTracking(true);
    }
    // AsyncStorage.setItem(Constants.LAST_JOB_SINCE, moment().format());
    if (
      tempDataList == null ||
      (tempDataList != null && tempDataList.length === 0)
    ) {
      AsyncStorage.getItem(Constants.LAST_JOB_SINCE).then(async (res) => {
        if (res != null) {
          const minutes = moment().diff(moment(res), 'minutes');
          if (minutes >= Constants.FORCE_LOGOUT_TIME_LIMIT) {
            AsyncStorage.removeItem(Constants.LAST_JOB_SINCE);
            const manifestId = manifestData.id;
            await Logout(
              dispatch,
              networkModel,
              authState,
              auth,
              epodRealm,
              callActionSyncApi,
              getAllPendingAction,
              callGetMasterDataApi,
              callGetDeltaSyncApi,
              true,
              updateActionsSyncLockToPending,
              updateActionSyncLock,
              manifestId,
              userModel,
              false,
              setGPSTracking,
            );
          }
        } else {
          AsyncStorage.setItem(Constants.LAST_JOB_SINCE, moment().format());
        }
      });
    } else {
      AsyncStorage.setItem(Constants.LAST_JOB_SINCE, moment().format());
    }

    if (joblistModel.filterType === Constants.JobType.ALL) {
      const jobNumPayload = {
        pendingJobNum: tempDataList.length,
      };
      dispatch(createAction(ActionType.SET_PENDING_JOB_NUM, jobNumPayload));
    }

    const payload = {
      isRefresh: false,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
  };

  const checkJobIsVIP = (object) => {
    if (
      !object ||
      !object.customer ||
      !object.customer.customerConfigurations
    ) {
      return false;
    }

    const tagsArray = object.tags
      ? object.tags.split(',').map((tag) => tag.trim())
      : [];
    const hasVipTag = tagsArray.includes('VIP');
    const hasExpensiveTag = tagsArray.includes('EXPENSIVE');

    const configTags = object.customer.customerConfigurations.map(
      (config) => config.tagName,
    );
    const hasVipConfig = configTags.includes('VIP');
    const hasExpensiveConfig = configTags.includes('EXPENSIVE');

    return (
      (hasVipTag && hasVipConfig) || (hasExpensiveTag && hasExpensiveConfig)
    );
  };

  const compiledJobList = () => {
    const array = [...originalDataListRef.current];
    let normalArray = [];
    let vipArray = [];

    array.forEach((element) => {
      if (checkJobIsVIP(element)) {
        vipArray.push(element);
      } else {
        normalArray.push(element);
      }
    });

    if (normalSortOption !== '') {
      normalArray = sortJob(
        normalArray,
        normalSortOption.type,
        normalSortOption.order,
      );
    }

    if (vipSortOption !== '') {
      vipArray = sortJob(vipArray, vipSortOption.type, vipSortOption.order);
    }

    setDataList([...vipArray, ...normalArray]);
  };

  sortJob = (array, key, order) => {
    const ascending = order === 'asc';
    let sortedArray = [];

    if (key == 'shopCode') {
      sortedArray = array.sort((a, b) => {
        const hasShopA = a.shop && a.shop.shopCode;
        const hasShopB = b.shop && b.shop.shopCode;

        // If both are null/undefined, keep original order
        if (!hasShopA && !hasShopB) return 0;
        // If A is null but B isn't, A goes after
        if (!hasShopA) return 1;
        // If B is null but A isn't, B goes after
        if (!hasShopB) return -1;

        return ascending
          ? a.shop.shopCode.localeCompare(b.shop.shopCode)
          : b.shop.shopCode.localeCompare(a.shop.shopCode);
      });
    } else {
      sortedArray = array.sort((a, b) => {
        let valueA = key.split('.').reduce((o, k) => (o || {})[k], a);
        let valueB = key.split('.').reduce((o, k) => (o || {})[k], b);

        if (valueA == null) valueA = '';
        if (valueB == null) valueB = '';

        // Date Sorting
        if (
          typeof valueA === 'string' &&
          Date.parse(valueA) &&
          typeof valueB === 'string' &&
          Date.parse(valueB)
        ) {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
          return ascending ? valueA - valueB : valueB - valueA;
        }

        // Boolean Sorting
        if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
          return ascending ? valueA - valueB : valueB - valueA;
        }

        // String Sorting
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
          return ascending
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // Number Sorting
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return ascending ? valueA - valueB : valueB - valueA;
        }

        return 0;
      });
    }
    return sortedArray;
  };

  useEffect(() => {
    if (joblistModel.isRefresh) {
      getPendingJobList();
    }
  }, [joblistModel.isRefresh]);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    } else {
      getPendingJobList();
    }
  }, [EpodRealmHelper, epodRealm, joblistModel.filterType, manifestData.jobs]);

  useEffect(() => {
    compiledJobList();
  }, [normalSortOption, vipSortOption]);

  useEffect(() => {
    setNormalSortOption(JobSortRealmManager.getJobSortOption(epodRealm, false));
    setVipSortOption(JobSortRealmManager.getJobSortOption(epodRealm, true));

    const normalSortListener = JobSortRealmManager.addSortOptionListener(
      epodRealm,
      false,
      (newSortOption) => setNormalSortOption(newSortOption),
    );

    const vipSortListener = JobSortRealmManager.addSortOptionListener(
      epodRealm,
      true,
      (newSortOption) => setVipSortOption(newSortOption),
    );

    return () => {
      normalSortListener.remove();
      vipSortListener.remove();
    };
  }, [epodRealm]);

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarLabel: translationString.formatString(
        translationString.in_progress_title,
        datalist.length,
      ),
    });
  }, [navigation, datalist, languageModel]);

  const checkIsManifestDriverChange = async () => {
    const manifestResult = await ManifestRealmManager.geManifestByManifestId(
      manifestData,
      epodRealm,
    );

    const manifest = Array.isArray(manifestResult)
      ? manifestResult
      : Array.from(manifestResult || []);

    if (manifest.length > 0) {
      const isOwner = manifest[0]?.userId === userModel.id;
      if (!isOwner) {
        const manifestId = manifestData.id;
        await Logout(
          dispatch,
          networkModel,
          authState,
          auth,
          epodRealm,
          callActionSyncApi,
          getAllPendingAction,
          callGetMasterDataApi,
          callGetDeltaSyncApi,
          true,
          updateActionsSyncLockToPending,
          updateActionSyncLock,
          manifestId,
          userModel,
          true,
          setGPSTracking,
        );
      }
    }
  };

  return {
    authState,
    joblistModel,
    loginModalModel,
    networkModel,
    manifestData,
    masterData,
    datalist,
    getPendingJobList,
    checkIsManifestDriverChange,
    userModel,
    setNormalSortOption,
    normalSortOption,
    setVipSortOption,
    vipSortOption,
  };
};
