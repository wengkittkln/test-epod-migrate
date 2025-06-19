import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {StackNavigationProp} from '@react-navigation/stack';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import {IndexContext} from '../../Context/IndexContext';
import * as JobRealmManager from '../../Database/realmManager/JobRealmManager';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {JobList} from '../../Model/JobList';
import {JobItemList} from '../../Model/JobTransfer';
import {JobTransferParamsList} from '../../NavigationStacks/JobTransferStack';
import {useJobTransferProvider} from '../../Provider/JobTransferProvider';
import store from '../../Reducers/index';
import {ToastMessageError} from '../../Components/Toast/ToastMessage';
import {RouteProp} from '@react-navigation/native';
import {createAction} from './../../Actions/CreateActions';
import * as ActionType from './../../Actions/ActionTypes';

export const useJobTransferJobList = (
  route: RouteProp<JobTransferParamsList, 'JobTransferJobList'>,
  navigation: StackNavigationProp<JobTransferParamsList, 'JobTransferJobList'>,
) => {
  const jobTransferProvider = useJobTransferProvider();

  const joblistModel = useSelector<typeof store>(
    (state) => state.JobListReducer,
  ) as JobList;

  const selectedJobListReducer = useSelector<typeof store>(
    (state) => state.JobTransferReducerV2,
  ) as any;

  const {manifestData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);

  const dispatch = useDispatch();

  // const [selectedJob, setSelectedJob] = useState('');
  const [datalist, setDataList] = useState<JobItemList[]>([]);
  const [paramsId, setParamsId] = useState('');

  const getPendingJobList = (params = '') => {
    let localPendingJobList: [] = [];
    let tempDataList: JobItemList[] = [];

    localPendingJobList =
      JobRealmManager.getAllJobByTransferStatusSortByDescStatusAscSeqAscTime(
        epodRealm,
        Constants.JobStatus.IN_PROGRESS,
      );

    localPendingJobList.map((item) => {
      let jobModel = GeneralHelper.convertRealmObjectToJSON(
        item,
      ) as JobItemList;
      jobModel.isSelected = jobTransferProvider.getSelected(jobModel.id);
      if (
        selectedJobListReducer.selected !== null &&
        selectedJobListReducer.selected !== '' &&
        selectedJobListReducer.selected !== undefined &&
        !jobModel.isSelected
      ) {
        if (selectedJobListReducer.selected.includes(jobModel.id.toString())) {
          jobTransferProvider.onSelected(jobModel);
          jobModel.isSelected = true;
        }
      }
      tempDataList.push(jobModel);
    });
    setDataList(tempDataList);
  };

  const selectJob = (item: JobItemList): boolean => {
    const data = item.id + ',' + item.trackingList + '|';
    let isAdd = false;

    if (!jobTransferProvider.selectedJobList.find((x) => x.id == item.id)) {
      const selectedItem: JobItemList = {
        id: item.id,
        trackingList: item.trackingList!,
        consignee: item.consignee,
        destination: item.destination,
        totalQuantity: item.totalQuantity,
        jobType: item.jobType,
        codAmount: item.codAmount,
        isSelected: item.isSelected,
      };

      const jobNumPayload = {
        selected: selectedJobListReducer.selected + data,
      };

      dispatch(
        createAction(ActionType.SET_JOB_TRANSFER_SELECTED_ITEMS, jobNumPayload),
      );

      jobTransferProvider.setCompressString(selectedJobListReducer.selected);
      jobTransferProvider.onSelected(selectedItem);
      isAdd = true;
    }
    return isAdd;
  };

  const deleteSelectedJob = (id: number, trackingList: string) => {
    let selectedData = selectedJobListReducer.selected;
    selectedData = selectedData.replace(id + ',' + trackingList + '|', '');
    const jobNumPayload = {
      selected: selectedData,
    };
    dispatch(
      createAction(ActionType.SET_JOB_TRANSFER_SELECTED_ITEMS, jobNumPayload),
    );

    jobTransferProvider.onRemove(id);
  };

  const getSelectedCount = (): string => {
    return translationString.formatString(
      translationString.confirm_job_receive,
      `(${jobTransferProvider.selectedJobList.length})`,
    ) as string;
  };

  const confirmSelection = () => {
    if (jobTransferProvider.selectedJobList.length > 0) {
      navigation.navigate('JobTransferAdd');
    } else {
      ToastMessageError({
        text1: translationString.job_transfers.select_at_least_one_job,
      });
    }
  };

  const scanqr = async () => {
    // console.log(`The current value of selectedJob is: ${selectedJob}`);
    navigation.navigate('JobTransferScan');
  };

  useEffect(() => {
    getPendingJobList();
  }, [paramsId]);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    } else {
      getPendingJobList();
    }
  }, [
    EpodRealmHelper,
    epodRealm,
    joblistModel.filterType,
    manifestData.jobs,
    joblistModel.isRefresh,
  ]);

  useEffect(() => {
    // console.log('joblist');
    // console.log(selectedJobListReducer.selected);
    getPendingJobList();
    //   const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    //   return () => backHandler.remove()
  }, [selectedJobListReducer.selected]);
  // useEffect(() => {

  //   console.log(params);

  // }, [route.params]);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     let params = route.params as ReceivedJobItem;
  //     if (params !== null && params !== undefined) {
  //       setParamsId(params.trackingList);
  //     } else {
  //       setParamsId('');
  //     }
  //     return unsubscribe;
  //   });
  // }, [navigation]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     getPendingJobList();
  //   }, []),
  // );

  return {
    datalist,
    selectJob,
    deleteSelectedJob,
    getSelectedCount,
    confirmSelection,
    scanqr,
  };
};
