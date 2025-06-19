import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {useEffect, useState} from 'react';
import {JobTransfer} from '../../../Model/DatabaseModel/JobTransfer';
import {Location} from '../../../Model/Location';
import {JobTransferParamsList} from '../../../NavigationStacks/JobTransferStack';
import {useJobTransferProvider} from '../../../Provider/JobTransferProvider';
import * as JobTransferRealmManager from './../../../Database/realmManager/JobTransferRealmManager';
import * as JobRealmManager from './../../../Database/realmManager/JobRealmManager';
import {IndexContext} from '../../../Context/IndexContext';
import {useSelector, useDispatch} from 'react-redux';
import store from '../../../Reducers';
import {User} from '../../../Model/User';
import * as ApiController from '../../../ApiController/ApiController';
import {Network} from './../../../Model/Network';
import {SyncStatus} from './../../../CommonConfig/Constants';
import {translationString} from '../../../Assets/translation/Translation';
import moment from 'moment';
import {useMasterData} from '../../MasterData/useMasterData';
import {useDeltaSync} from '../../DeltaSync/useDeltaSync';
import {v4 as uuidv4} from 'uuid';
import {getQueue} from '../../../../App';
import {
  ToastMessage,
  ToastMessageError,
} from '../../../Components/Toast/ToastMessage';
import {useAuth} from '../../Auth/useAuth';
import {BackHandler} from 'react-native';
import * as RootNavigation from '../../../rootNavigation';
import {createAction} from './../../../Actions/CreateActions';
import * as ActionType from './../../../Actions/ActionTypes';

export const useJobTransferDetail_Bak = (
  navigation: StackNavigationProp<JobTransferParamsList, 'JobTransferDetail'>,
) => {
  const {callGetMasterDataApi} = useMasterData();
  const {callGetDeltaSyncApi} = useDeltaSync(
    callGetMasterDataApi,
    'useJobTransferDetail_Bak',
  );
  const dispatch = useDispatch();
  const {epodRealm, EpodRealmHelper, manifestData} =
    React.useContext(IndexContext);

  const statusReducer = useSelector<typeof store>(
    (state) => state.JobTransferReducerV2,
  ) as any;

  const {auth, authState, noOrderMsg} = useAuth(
    manifestData,
    epodRealm.current,
    EpodRealmHelper,
  );

  const networkModel = useSelector<typeof store>(
    (state) => state.NetworkReducer,
  ) as Network;
  const locationModel = useSelector<typeof store>(
    (state) => state.LocationReducer,
  ) as Location;
  const userModel = useSelector<typeof store>(
    (state) => state.UserReducer,
  ) as User;

  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [trackingList, setTrackingList] = useState<string[]>([]);
  const [parcelQty, setParcelQty] = useState(0);
  const [transferReason, setTransferReason] = useState('');
  const [compressString, setCompressString] = useState('');
  const [status, setStatus] = useState(0);
  const [syncStatus, setSyncStatus] = useState(1);
  const [jobQty, setJobQty] = useState(0);
  const queue = getQueue();

  //const [qrRef, setQrRef]: any = useState(null);
  //const [qrDataUrl, setQrDataUrl] = useState('');

  const jobTransferProvider = useJobTransferProvider();

  const confirmTransfer = async () => {
    setIsShowLoadingIndicator(true);
    const newRequest: JobTransfer = {
      Id: uuidv4(),
      CompressString: compressString,
      RequestedBy: jobTransferProvider.fromUser,
      RequestedDate: moment().format(),
      TransferReason: jobTransferProvider.transferReason,
      Status: 1,
      ParcelQuantity: jobTransferProvider.parcelQty,
      latitude: locationModel.latitude,
      longitude: locationModel.longitude,
    };

    try {
      for (let x of jobTransferProvider.selectedJobList) {
        JobRealmManager.updateJobTransferStatus(x.id, true, epodRealm);
      }

      JobTransferRealmManager.insertNewItem(newRequest, epodRealm);
      jobTransferProvider.setStatus(1);
      setStatus(1);

      //get id from object list
      const idList = jobTransferProvider.selectedJobList.map((item) => {
        return item.id;
      });
      setSyncStatus(0);
      if (networkModel.isConnected) {
        setSyncStatus(1);
        setStatus(1);

        const response = await ApiController.unassignJob(
          idList,
          locationModel.latitude,
          locationModel.longitude,
        );

        if (response.status == 200) {
          console.log(moment().format());
          ToastMessage(translationString.job_transfers.transfer_send_success);
          jobTransferProvider.setStatus(1);
          setStatus(1);

          JobTransferRealmManager.updateSyncStatus(
            newRequest.Id!,
            SyncStatus.SYNC_SUCCESS,
            epodRealm,
          );
          newRequest.SyncStatus = SyncStatus.SYNC_SUCCESS;

          if (response.data.message != '') {
            ToastMessage(response.data.message);
          }
        } else {
          ToastMessageError(translationString.job_transfers.transfer_send_fail);
        }
      } else {
        startActionSync();
        jobTransferProvider.setStatus(1);
        setStatus(1);
        ToastMessageError(translationString.no_internet_connection);
      }

      const statusDispatch = {
        status: 1,
      };
      dispatch(
        createAction(ActionType.SET_JOB_TRANSFER_STATUS, statusDispatch),
      );
    } catch (error) {
      console.log('error', error);
      setIsShowLoadingIndicator(false);
      ToastMessageError(
        translationString.job_transfers.transfer_send_fail_create,
      );
    }
    setIsShowLoadingIndicator(false);
  };

  const startActionSync = async () => {
    // if (queue.status === 'inactive') {
    //   queue.createJob(
    //     'syncActionWorker',
    //     {data: 'test', attempts: 0},
    //     {
    //       attempts: 0,
    //       priority: 10,
    //       timeout: 0, // api timeout after 60s
    //     },
    //     false,
    //   );
    //   queue.start();
    // }
  };

  const confirmReceive = async () => {
    setIsShowLoadingIndicator(true);
    if (networkModel.isConnected) {
      try {
        const idList = jobTransferProvider.selectedJobList.map((item) => {
          return item.id;
        });

        const newRequest: JobTransfer = {
          Id: uuidv4(),
          CompressString: compressString,
          RequestedBy: jobTransferProvider.fromUser,
          RequestedDate: '',
          TransferReason: jobTransferProvider.transferReason,
          Status: 3,
          ParcelQuantity: Number(jobTransferProvider.parcelQty),
          latitude: locationModel.latitude,
          longitude: locationModel.longitude,
          AcceptedBy: userModel.username,
          AcceptedDate: moment().format(),
          SyncStatus: SyncStatus.SYNC_SUCCESS,
        };
        const temp = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        const response = await ApiController.ReceivedJob(
          idList,
          locationModel.latitude,
          locationModel.longitude,
          manifestData.id,
          jobTransferProvider.preManifestId,
          temp,
        );

        if (response.status == 200) {
          console.log(response.data.message);
          if (response.data.message == '') {
            for (let x of idList) {
              JobRealmManager.updateJobTransferStatus(x, false, epodRealm);
            }

            JobTransferRealmManager.insertNewItem(newRequest, epodRealm);
            jobTransferProvider.setStatus(3);
            setStatus(3);
            ToastMessage(translationString.job_transfers.receive_success);
            navigation.popToTop();
          } else {
            ToastMessageError(response.data.message);
          }
        } else {
          ToastMessageError(
            translationString.formatString(
              translationString.job_transfers.receive_failed,
              jobTransferProvider.fromUser,
            ) as string,
          );
        }
      } catch (error) {
        setIsShowLoadingIndicator(false);
        console.log('error', error);
        ToastMessageError(
          translationString.formatString(
            translationString.job_transfers.receive_failed,
            jobTransferProvider.fromUser,
          ) as string,
        );
      }
    } else {
      ToastMessageError(translationString.no_internet_connection);
    }
    setIsShowLoadingIndicator(false);
  };

  const goBack = () => {
    const statusDispatch = statusReducer.status;
    console.log(statusReducer.status);
    if (statusDispatch === 0) {
      navigation.goBack();
    } else {
      navigation.popToTop();
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    let statusDispatch = {
      status: 0,
    };

    dispatch(createAction(ActionType.SET_JOB_TRANSFER_STATUS, statusDispatch));

    let compressString = jobTransferProvider.compressString;
    compressString =
      'JT|' +
      jobTransferProvider.fromUser +
      '|' +
      jobTransferProvider.parcelQty +
      '|' +
      jobTransferProvider.transferReason +
      '|' +
      (manifestData.id ?? 0) +
      '|' +
      compressString;

    setSyncStatus(jobTransferProvider.isSynced == 0 ? 0 : 1);
    setParcelQty(jobTransferProvider.parcelQty);
    setTransferReason(jobTransferProvider.transferReason);
    setCompressString(compressString);
    setStatus(jobTransferProvider.status);
    setJobQty(jobTransferProvider.selectedJobList.length);
    const selectedList = jobTransferProvider.selectedJobList;

    setTrackingList([]);
    selectedList.forEach((item) => {
      item.trackingList.split(',').forEach((y) => {
        setTrackingList((x) => [...x, y.trim()]);
      });
    });

    statusDispatch = {
      status: jobTransferProvider.status,
    };

    dispatch(createAction(ActionType.SET_JOB_TRANSFER_STATUS, statusDispatch));
  }, []);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [epodRealm]);

  return {
    trackingList,
    parcelQty,
    transferReason,
    compressString,
    status,
    syncStatus,
    isShowLoadingIndicator,
    jobQty,
    // qrRef,
    // setQrRef,
    confirmTransfer,
    confirmReceive,
    goBack,
    // getDataURL,
  };
};
