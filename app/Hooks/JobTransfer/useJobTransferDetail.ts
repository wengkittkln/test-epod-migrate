import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {useEffect, useState} from 'react';
import {JobTransfer} from '../../Model/DatabaseModel/JobTransfer';
import {Location} from '../../Model/Location';
import {JobTransferParamsList} from '../../NavigationStacks/JobTransferStack';
import {useJobTransferProvider} from '../../Provider/JobTransferProvider';
import * as JobTransferRealmManager from './../../Database/realmManager/JobTransferRealmManager';
import * as JobRealmManager from './../../Database/realmManager/JobRealmManager';
import {IndexContext} from '../../Context/IndexContext';
import {useSelector, useDispatch} from 'react-redux';
import store from '../../Reducers';
import {User} from '../../Model/User';
import * as ApiController from '../../ApiController/ApiController';
import {Network} from './../../Model/Network';
import {translationString} from '../../Assets/translation/Translation';
import moment from 'moment';
import {
  ToastMessage,
  ToastMessageError,
} from '../../Components/Toast/ToastMessage';
import {BackHandler} from 'react-native';
import * as RootNavigation from '../../rootNavigation';
import {createAction} from './../../Actions/CreateActions';
import * as ActionType from './../../Actions/ActionTypes';
import {CreateTransferRequestModel} from '../../Model/JobTransfer';
import * as UsersRealmManager from '../../Database/realmManager/UsersRealmManager';
import {JobTransferStatus} from '../../CommonConfig/Constants';
import {AxiosError} from 'axios';

export const useJobTransferDetail = (
  navigation: StackNavigationProp<JobTransferParamsList, 'JobTransferDetail'>,
) => {
  const dispatch = useDispatch();
  const {epodRealm, EpodRealmHelper, manifestData} =
    React.useContext(IndexContext);

  const statusReducer = useSelector<typeof store>(
    (state) => state.JobTransferReducerV2,
  ) as any;

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
  const [status, setStatus] = useState(0);
  const [jobQty, setJobQty] = useState(0);
  const [driver, setDriver] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [receivedQty, setReceivedQty] = useState('');
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isShowQtyDialog, setIsShowQtyDialog] = useState(false);

  const jobTransferProvider = useJobTransferProvider();

  const confirmTransfer = async () => {
    setIsShowLoadingIndicator(true);
    const newRequest: JobTransfer = {
      createdBy: userModel.id,
      createdByName: userModel.name,
      transferReason: jobTransferProvider.transferReason,
      transferedParcelQuantity: jobTransferProvider.parcelQty,
      latitude: locationModel.latitude,
      longitude: locationModel.longitude,
      status: 0,
      toDriver: jobTransferProvider.driver,
    };

    if (networkModel.isConnected) {
      try {
        //get id from object list
        const jobDetails = jobTransferProvider.selectedJobList.map((item) => {
          return item.id + ',' + item.trackingList;
        });

        const idList = jobTransferProvider.selectedJobList.map((item) => {
          return item.id;
        });

        const driverId = jobTransferProvider.driver!.split('|')[0];

        const requestModel: CreateTransferRequestModel = {
          jobDetails: jobDetails.join('|'),
          transferedParcelQuantity: parcelQty,
          transferReason: jobTransferProvider.transferReason,
          transferTo: Number(driverId),
          latitude: locationModel.latitude,
          longitude: locationModel.longitude,
        };

        ApiController.confirmTransferRequest(requestModel)
          .then((response) => {
            console.log(response.data);
            if (response.data.statusCode === 200) {
              for (let x of idList) {
                JobRealmManager.updateJobTransferStatus(x, true, epodRealm);
              }

              newRequest.jobDetails = jobDetails.join('|');
              newRequest.jobIds = jobDetails.join('|');
              newRequest.id = response.data.id;
              newRequest.createdDate = moment(
                response.data.createdDate,
              ).format();
              newRequest.transferTo = Number(driverId);

              JobTransferRealmManager.insertNewItem(newRequest, epodRealm);

              jobTransferProvider.setStatus(0);
              jobTransferProvider.setId(newRequest.id!);
              setStatus(0);

              ToastMessage({
                text1: translationString.job_transfers.transfer_send_success,
              });

              if (response.data.message != '') {
                ToastMessage({
                  text1: response.data.message,
                });
              }

              const statusDispatch = {
                status: 0,
              };
              dispatch(
                createAction(
                  ActionType.SET_JOB_TRANSFER_STATUS,
                  statusDispatch,
                ),
              );
              if (navigation.canGoBack()) {
                const payload = {
                  isRefresh: true,
                };
                dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
                navigation.navigate('JobTransfer');
              }
            }
          })
          .catch((err: AxiosError) => {
            console.log('err', err);
            ToastMessageError({
              text1: translationString.job_transfers.transfer_send_fail,
              text2: err.response?.data?.message,
            });
          })
          .finally(() => {
            setIsShowLoadingIndicator(false);
          });
      } catch (error) {
        console.log('error', error);
        setIsShowLoadingIndicator(false);
        ToastMessageError({
          text1: translationString.job_transfers.transfer_send_fail_create,
        });
      }
    } else {
      setIsShowLoadingIndicator(false);
      jobTransferProvider.setStatus(-1);
      setStatus(-1);
      ToastMessageError({
        text1: translationString.no_internet_connection,
      });
    }
  };

  const cancelRequest = async () => {
    if (networkModel.isConnected) {
      try {
        ApiController.cancelTransferRequest(
          jobTransferProvider.id,
          locationModel.latitude,
          locationModel.longitude,
        )
          .then((response) => {
            if (response.data.statusCode === 200) {
              const idList = jobTransferProvider.selectedJobList.map((item) => {
                return item.id;
              });

              for (let x of idList) {
                JobRealmManager.updateJobTransferStatus(x, false, epodRealm);
              }

              JobTransferRealmManager.updateJobTransferStatus(
                epodRealm,
                jobTransferProvider.id,
                1,
              );
              setStatus(1);
              jobTransferProvider.setStatus(1);

              ToastMessage({
                text1: translationString.job_transfers.cancelRequestSuccess,
              });

              if (navigation.canGoBack()) {
                const payload = {
                  isRefresh: true,
                };
                dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
                navigation.navigate('JobTransfer');
              }
            }
          })
          .catch((err) => {
            console.log(err);
            ToastMessageError({
              text1: translationString.job_transfers.transferCancelfail,
              text2: err.response?.data?.message,
            });
          })
          .finally(() => {
            setIsShowLoadingIndicator(false);
          });
      } catch (error) {
        console.log('error', error);
        setIsShowLoadingIndicator(false);

        ToastMessageError({
          text1: translationString.job_transfers.transfer_send_fail_create,
        });
      }
    } else {
      jobTransferProvider.setStatus(0);
      setIsShowLoadingIndicator(false);
      ToastMessageError({
        text1: translationString.no_internet_connection,
      });
    }
  };

  const confirmReceive = async (isAccept: boolean) => {
    if (networkModel.isConnected) {
      try {
        if (!isAccept && !rejectReason) {
          setIsShowLoadingIndicator(false);
          ToastMessageError({
            text1: translationString.job_transfers.pleaseEnterReason,
          });
          return;
        } else {
          setIsShowDialog(false);
        }

        if (isAccept && !receivedQty) {
          setIsShowLoadingIndicator(false);
          ToastMessageError({
            text1: translationString.job_transfers.enter_parcel_quantity_error,
          });
          return;
        } else {
          setIsShowQtyDialog(false);
        }

        let manifestId = manifestData?.id ?? '';

        const errMsg = !isAccept
          ? translationString.formatString(
              translationString.job_transfers.transferRejectfail,
              jobTransferProvider.fromUser,
            )
          : translationString.formatString(
              translationString.job_transfers.receive_failed,
              jobTransferProvider.fromUser,
            );

        const successMsg = !isAccept
          ? translationString.formatString(
              translationString.job_transfers.rejectRequestSuccess,
              jobTransferProvider.fromUser,
            )
          : translationString.formatString(
              translationString.job_transfers.receive_success,
              jobTransferProvider.fromUser,
            );

        await ApiController.ReceivedJob(
          jobTransferProvider.id,
          manifestId,
          isAccept,
          rejectReason,
          receivedQty,
        )
          .then((response) => {
            if (response.status == 200) {
              ToastMessageError({
                text1: successMsg as string,
              });

              JobTransferRealmManager.updateJobTransferStatus(
                epodRealm,
                jobTransferProvider.id,
                isAccept ? 3 : 2,
              );

              manifestData.marketDateUpdate = Date();
              manifestData.marketDateUpdateLocation = 'PendingJobListScreen'; // to limit delta sync call one time only

              if (manifestData.id == null) {
                RootNavigation.navigate('Main');
              } else {
                jobTransferProvider.setStatus(isAccept ? 3 : 2);
                setStatus(isAccept ? 3 : 2);
              }

              if (navigation.canGoBack()) {
                if (isAccept) navigation.navigate('JobTransfer');
                else navigation.popToTop();
              }
            }
          })
          .catch((err) => {
            console.log(err);
            ToastMessageError({
              text1: errMsg as string,
              text2: err.response?.data?.message,
            });
          })
          .finally(() => {
            setIsShowLoadingIndicator(false);
          });
      } catch (error) {
        setIsShowLoadingIndicator(false);
        console.log('error', error);
        ToastMessageError({
          text1: translationString.formatString(
            translationString.job_transfers.receive_failed,
            jobTransferProvider.fromUser,
          ) as string,
        });
      }
    } else {
      ToastMessageError({
        text1: translationString.no_internet_connection,
      });
      setIsShowLoadingIndicator(false);
    }
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

  const getStatusColor = (syncStatus = 0): string => {
    switch (syncStatus) {
      case JobTransferStatus.PENDING:
        return '#ababab';
      case JobTransferStatus.COMPLETED:
        return '#45be2a';
      case JobTransferStatus.REJECTED:
        return '#cc0027';
      case JobTransferStatus.CANCELLED:
        return '#da7dcf';
      default:
        return 'transparent';
    }
  };

  useEffect(() => {
    //When new create transfer request
    const driverDetail = jobTransferProvider.driver.split('|');
    if (driverDetail && driverDetail.length > 1) {
      setDriver(driverDetail[1]);
    } else {
      const user = UsersRealmManager.selectUserById(
        epodRealm,
        Number(jobTransferProvider.driver),
      );
      if (user) setDriver(user.displayName);
      else setDriver('NOT_FOUND');
    }
    setParcelQty(jobTransferProvider.parcelQty);
    setTransferReason(jobTransferProvider.transferReason?.split('|')[1]);
    setStatus(jobTransferProvider.status);
    setJobQty(jobTransferProvider.selectedJobList.length);
    setRejectReason(jobTransferProvider.rejectReason);

    const selectedList = jobTransferProvider.selectedJobList;

    setTrackingList([]);

    selectedList.forEach((item) => {
      item.trackingList.split(',').forEach((y) => {
        setTrackingList((x) => [...x, y.trim()]);
      });
    });

    const statusDispatch = {
      status: jobTransferProvider.status,
    };

    dispatch(createAction(ActionType.SET_JOB_TRANSFER_STATUS, statusDispatch));

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  const getStatusText = (status?: number): string => {
    switch (status) {
      case 0:
        return translationString.job_transfers.pending;
      case 1:
        return translationString.job_transfers.cancelled;
      case 2:
        return translationString.job_transfers.rejected;
      case 3:
        return translationString.job_transfers.completed;
      default:
        return '';
    }
  };

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [epodRealm]);

  return {
    trackingList,
    parcelQty,
    transferReason,
    status,
    isShowLoadingIndicator,
    jobQty,
    fromUser: jobTransferProvider.fromUser,
    username: userModel.id.toString(),
    driver,
    isShowDialog,
    rejectReason,
    id: jobTransferProvider.id,
    isShowQtyDialog,
    receivedQty,
    confirmTransfer,
    confirmReceive,
    goBack,
    cancelRequest,
    setIsShowDialog,
    setRejectReason,
    setIsShowLoadingIndicator,
    getStatusColor,
    getStatusText,
    setIsShowQtyDialog,
    setReceivedQty,
  };
};
