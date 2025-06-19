/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image, InteractionManager} from 'react-native';
import * as Constants from '../../../CommonConfig/Constants';
import * as GeneralHelper from '../../../Helper/GeneralHelper';
import {translationString} from '../../../Assets/translation/Translation';
import {IndexContext} from '../../../Context/IndexContext';
import * as OrderRealmManager from '../../../Database/realmManager/OrderRealmManager';
import * as OrderItemRealmManager from '../../../Database/realmManager/OrderItemRealmManager';
import BackButton from '../../../Assets/image/icon_back_white.png';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import moment from 'moment';
import {useSelector, useDispatch} from 'react-redux';
import * as JobHelper from '../../../Helper/JobHelper';
import {createAction} from '../../../Actions/CreateActions';
import * as ActionType from '../../../Actions/ActionTypes';
import {ActionSyncContext} from '../../../Context/ActionSyncContext';
import * as PhotoRealmManager from '../../../Database/realmManager/PhotoRealmManager';
import * as JobRealmManager from '../../../Database/realmManager/JobRealmManager';

export const useJobDetail = (route, navigation) => {
  const job = route.params.job;
  const consigneeName = route.params.consigneeName;
  const trackNumModel = route.params.trackNumModel;
  const step = route.params.step;
  const stepCode = step && step.stepCode ? step.stepCode : '';
  const requestTime = route.params.requestTime;
  const [orderList, setOrderList] = useState([]);
  const [containerList, setContainerList] = useState([]);
  const {epodRealm} = React.useContext(IndexContext);
  const locationModel = useSelector((state) => state.LocationReducer);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const [isModalVisible, setModalVisible] = useState(false);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const dispatch = useDispatch();
  const [totalPhoto, setTotalPhoto] = useState(0);
  const [totalSyncedPhoto, setTotalSyncedPhoto] = useState(0);
  const [isShowDecrypt, setIsShowDecrypt] = useState(false);
  const [decryptedConsignee, setDecryptedConsignee] = useState(consigneeName);
  const [decryptedContact, setDecryptedContact] = useState(job.contact);

  // InteractionManager.runAfterInteractions(() => {
  //   setIsLoading(false);
  // });

  useEffect(() => {
    if (isShowDecrypt) {
      dispatch({type: 'ENABLE_WATERMARK'});
    } else {
      dispatch({type: 'DISABLE_WATERMARK'});
    }
  }, [isShowDecrypt]);

  useEffect(() => {
    let selectedOrder = OrderRealmManager.getOrderByJodId(job.id, epodRealm);

    let selectedContainer = JobRealmManager.getJobContainersByJobId(
      job.id,
      epodRealm,
    );

    if (selectedContainer && selectedContainer.length > 0) {
      setContainerList(selectedContainer);
    }

    if (selectedOrder.length > 0) {
      setOrderList(selectedOrder);
    }

    let photosModel = [];

    photosModel = PhotoRealmManager.getPhotoByJobIdExceptStatus(
      Constants.SyncStatus.PENDING_SELECT_PHOTO,
      job.id,
      epodRealm,
    );

    let totalPhoto = 0;
    let totalSyncedPhoto = 0;

    photosModel.map((item) => {
      let itemModel = GeneralHelper.convertRealmObjectToJSON(item);

      if (itemModel.syncStatus === Constants.SyncStatus.SYNC_SUCCESS) {
        totalSyncedPhoto++;
      }
      totalPhoto++;
    });
    setTotalPhoto(totalPhoto);
    setTotalSyncedPhoto(totalSyncedPhoto);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor:
          job.jobType === Constants.JobType.PICK_UP
            ? Constants.Dark_Grey
            : Constants.THEME_COLOR,
        shadowColor: 'transparent',
        shadowRadius: 0,
        shadowOffset: {
          height: 0,
        },
        elevation: 0,
      },
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight: null,
      headerTitle: translationString.do_title,
    });
  }, [navigation]);

  const getStatus = () => {
    let status = job.pendingStatus;
    if (job.status > job.pendingStatus) {
      status = job.status;
    }
    return status;
  };

  const getStatusText = () => {
    let status = getStatus();

    if (
      status === Constants.JobStatus.IN_PROGRESS &&
      job.jobType === Constants.JobType.DELIVERY
    ) {
      return translationString.in_progress;
    }

    if (
      status === Constants.JobStatus.IN_PROGRESS &&
      job.jobType === Constants.JobType.PICK_UP
    ) {
      return translationString.in_progress_pick_up;
    } else if (status === Constants.JobStatus.COMPLETED) {
      return translationString.completed;
    } else if (status === Constants.JobStatus.FAILED) {
      return translationString.failed;
    } else if (status === Constants.JobStatus.PARTIAL_DELIVERY) {
      return translationString.partial_delivery;
    } else {
      return translationString.in_progress;
    }
  };

  const getTotalQuantity = (orderItem) => {
    let totalQuantityLabel = translationString.exact_amount_title;

    if (
      job.status !== Constants.JobStatus.PARTIAL_DELIVERY &&
      job.jobType === Constants.JobType.DELIVERY
    ) {
      totalQuantityLabel = `${totalQuantityLabel}: ${orderItem.expectedQuantity}`;
    } else {
      if (orderItem.expectedQuantity > 0) {
        totalQuantityLabel = `${totalQuantityLabel} / ${translationString.expected_amount_title} : `;
      } else {
        totalQuantityLabel = totalQuantityLabel + ' : ';
      }

      let start = totalQuantityLabel.length;
      totalQuantityLabel = `${totalQuantityLabel}${orderItem.quantity}`;

      if (orderItem.expectedQuantity > 0) {
        totalQuantityLabel = `${totalQuantityLabel} /${orderItem.expectedQuantity}`;
      }

      if (totalQuantityLabel.length > 0 && orderItem.uom !== '') {
        totalQuantityLabel = totalQuantityLabel + ' ' + orderItem.uom;
      }
    }
    return totalQuantityLabel;
  };

  const contactButtonOnPressed = () => {
    if (stepCode)
      if (stepCode === Constants.StepCode.PRE_CALL) {
        navigation.navigate('PreCallAction', {
          job: job,
          consigneeName: consigneeName,
          stepCode: stepCode,
        });
      } else {
        navigation.navigate('GeneralCallReason', {
          job: job,
          reasonType: Constants.ReasonType.CALL_REASON,
          actionModel: {
            guid: uuidv4(),
            actionType: Constants.ActionType.GENERAL_CALL_START,
            jobId: job.id,
            operateTime: moment().format(),
            longitude: locationModel.longitude,
            latitude: locationModel.latitude,
          },
          stepCode: stepCode,
          consigneeName: consigneeName,
        });
      }
  };

  const nextButtonOnPressed = () => {
    JobHelper.gotoDetailScreen(job);
  };

  const cameraButtonOnPressed = () => {
    navigation.navigate('Camera', {
      job: job,
      stepCode: stepCode,
    });
  };

  const weightButtonOnPressed = () => {
    navigation.navigate('JobWeightCaptureManualEnter', {
      job: job,
      option: 'normal',
    });
  };

  const getReAttemptName = () => {
    let reattemptString = '';
    if (job.jobType === Constants.JobType.DELIVERY) {
      reattemptString = translationString.resend;
    } else if (job.jobType === Constants.JobType.PICK_UP) {
      reattemptString = translationString.repickup;
    }

    return reattemptString;
  };

  const redoJob = async () => {
    let actionType =
      job.jobType === Constants.JobType.PICK_UP
        ? Constants.ActionType.RECOLLECT
        : Constants.ActionType.RESEND;

    let actionModel = {
      guid: uuidv4(),
      actionType: actionType,
      jobId: job.id,
      operateTime: moment().format(),
      longitude: locationModel.longitude,
      latitude: locationModel.latitude,
      syncPhoto: Constants.SyncStatus.SYNC_SUCCESS,
      syncItem: Constants.SyncStatus.SYNC_SUCCESS,
    };

    await JobHelper.redo(job.id, actionModel, epodRealm);
    actionSyncAndRefreshJobList();
    setModalVisible(false);
  };

  const showHideDialog = (visible) => {
    setModalVisible(visible);
  };

  const getReAttemptMessage = () => {
    let reattemptString = '';
    if (job.jobType === Constants.JobType.DELIVERY) {
      reattemptString = translationString.resend_confirm;
    } else if (job.jobType === Constants.JobType.PICK_UP) {
      reattemptString = translationString.repickup_confirm;
    }

    return reattemptString;
  };

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    showHideDialog(false);
    navigation.popToTop();
  };

  const exportPhoto = () => {
    navigation.navigate('exportPhoto', {
      job: job,
      consigneeName: consigneeName,
      trackNumModel: trackNumModel,
      requestTime: requestTime,
      step: step,
    });
  };

  const getDecryptData = async () => {
    setDecryptedConsignee(
      !isShowDecrypt && job.decryptedConsignee?.length > 0
        ? job.decryptedConsignee
        : consigneeName,
    );
    setDecryptedContact(
      !isShowDecrypt && job.decryptedContact?.length > 0
        ? job.decryptedContact
        : job.contact,
    );

    setIsShowDecrypt((prevState) => !prevState);
  };

  return {
    getStatusText,
    getTotalQuantity,
    nextButtonOnPressed,
    cameraButtonOnPressed,
    contactButtonOnPressed,
    weightButtonOnPressed,
    getReAttemptName,
    redoJob,
    getReAttemptMessage,
    showHideDialog,
    exportPhoto,
    job,
    consigneeName,
    trackNumModel,
    requestTime,
    orderList,
    isModalVisible,
    totalPhoto,
    totalSyncedPhoto,
    containerList,
    isShowDecrypt,
    decryptedConsignee,
    decryptedContact,
    getDecryptData,
  };
};
