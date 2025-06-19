import React, {useState, useEffect, useLayoutEffect} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import moment from 'moment';

import RNFS from 'react-native-fs';
import {translationString} from '../../../../Assets/translation/Translation';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import * as Constants from '../../../../CommonConfig/Constants';
import * as OrderItemHelper from '../../../../Helper/OrderItemHelper';
import * as OrderHelper from '../../../../Helper/OrderHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as PhotoRealmManager from '../../../../Database/realmManager/PhotoRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import {IndexContext} from '../../../../Context/IndexContext';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import {useSelector, useDispatch} from 'react-redux';
import {createAction} from '../../../../Actions/CreateActions';
import * as ActionType from '../../../../Actions/ActionTypes';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import {addEventLog} from '../../../../Helper/AnalyticHelper';
import {gotoDetailScreen} from '../../../../Helper/JobHelper';

export const useEsignConfirm = (route, navigation) => {
  const job = route.params.job;
  const orders = route.params.orders;
  const orderItems = route.params.orderItemList;
  let action = route.params.action;
  const stepCode = route.params.stepCode;

  const isPD = route.params?.isPD ? route.params.isPD : false;

  let actionAttachment = route.params.actionAttachment;
  let actionDocSignAttachment = route.params.actionDocSignAttachment;
  const verificationMethod = route.params?.verificationMethod;
  const additionalParamsJson = route.params?.additionalParamsJson;

  // use to define photo taking flow else it is normal flow
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;

  const locationModel = useSelector((state) => state.LocationReducer);
  const currentBase64Photo = actionAttachment.filePath; // use file path column save
  const currentDocSignBase64Photo = actionDocSignAttachment.filePath; // use file path column save
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const dispatch = useDispatch();

  const [orderList, setOrderList] = useState([]);
  const [orderItemList, setOrderItemList] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [totalCOD, setTotalCOD] = useState('-');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);

  let filterTimeout;

  useEffect(() => {
    setOrderList(orders);
    setOrderItemList(orderItems);
  }, []);

  useEffect(() => {
    getQuantity();
  }, [orderItemList]);

  useEffect(() => {
    getTotalCOD();
  }, [orderList]);

  const getQuantityText = () => {
    let title = translationString.formatString(
      translationString.total_delivery,
      quantity,
    );

    return title;
  };

  const getQuantity = () => {
    const result = OrderItemHelper.getQuantity(orderItemList);
    setQuantity(result);
  };

  const getTotalCODText = () => {
    return totalCOD;
  };

  const viewOrderItem = () => {
    showHideDialog(true);
  };

  const showHideDialog = (visible) => {
    setModalVisible(visible);
  };

  const closeDialog = () => {
    showHideDialog(false);
  };

  const getTotalCOD = () => {
    const result = route.params?.totalActualCodAmt
      ? route.params?.totalActualCodAmt
      : OrderHelper.getTotalCOD(orderList);
    setTotalCOD(result);

    return result;
  };

  const submitEsignPhoto = async () => {
    setIsShowLoadingIndicator(true);
    const isSuccess = storeEsignToDB();
    setIsShowLoadingIndicator(false);

    // const step = JobHelper.getStepCode(
    //   job.customer,
    //   job.currentStepCode,
    //   job.jobType,
    // );
    // if (isSuccess) {
    //   gotoDetailScreen(job);
    //   //TODO navigation.popToTop(); or Next step
    //   navigation.popToTop();
    // }
  };

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };
    setIsShowLoadingIndicator(false);
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    navigation.popToTop();
    addEventLog('esign_confirm_complete', {
      user: `${
        userModel.id
      }; data: ${job.id.toString()}; operateAt: operateAt: ${moment().format(
        'YYYY-MM-DD HH:mm:ss',
      )}`,
    });
  };

  const updateJobInLocalDb = async (
    jobModel,
    currentStepCode,
    actionModel,
    isSuccess,
  ) => {
    try {
      await JobHelper.updateJob(
        jobModel,
        currentStepCode,
        actionModel,
        isSuccess,
        epodRealm,
      );
      return true;
    } catch (error) {
      alert('Update Job Error: ' + error);
      addEventLog('update_esign_error', {
        user: `${userModel.id}; data: ${JSON.stringify(
          actionModel,
        )}; error: ${error}; operateAt: operateAt: ${moment().format(
          'YYYY-MM-DD HH:mm:ss',
        )}`,
      });
      return false;
    }
  };

  const addNewAction = async (actionModel) => {
    try {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        ActionRealmManager.insertNewAction(actionModel, epodRealm);
      }, 1000);
    } catch (error) {
      addEventLog('add_esign_error', {
        user: `${userModel.id}; data: ${JSON.stringify(
          actionModel,
        )}; operateAt: operateAt: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      });
    }
  };

  const storeEsignToDB = () => {
    let isProcessSuccess = false;
    // create a path you want to write to
    // :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
    // but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
    const docSignPath =
      RNFS.DocumentDirectoryPath + '/' + actionDocSignAttachment.uuid + '.png';
    const path =
      RNFS.DocumentDirectoryPath + '/' + actionAttachment.uuid + '.png';
    const image_data = currentBase64Photo.replace('data:image/png;base64,', '');
    const doc_sign_image_data = currentDocSignBase64Photo.replace(
      'data:image/png;base64,',
      '',
    );
    // write the file

    RNFS.writeFile(docSignPath, doc_sign_image_data, 'base64')
      .then(async (_) => {
        actionDocSignAttachment.file = 'file://' + docSignPath;
        actionDocSignAttachment.syncStatus = Constants.SyncStatus.SYNC_PENDING;
        await PhotoRealmManager.updatePhotoData(
          actionDocSignAttachment,
          epodRealm,
        );
        return RNFS.writeFile(path, image_data, 'base64');
      })
      .then(async (success) => {
        actionAttachment.file = 'file://' + path;
        actionAttachment.syncStatus = Constants.SyncStatus.SYNC_PENDING;
        await PhotoRealmManager.updatePhotoData(actionAttachment, epodRealm);
        if (action.actionType === Constants.ActionType.PARTIAL_DLEIVER_FAIL) {
          if (stepCode === 'ESIGNBARCODE_POD') {
            let tempAction = action
              ? action
              : ActionHelper.generateActionModel(
                  job.id,
                  stepCode,
                  true,
                  locationModel,
                  null,
                  true,
                );

            if (orderList && orderList.length > 0) {
              tempAction.orderId = orderList[0].id;
            }

            navigation.navigate('ScanQr', {
              job: job,
              actionModel: tempAction,
              stepCode: stepCode,
              orderList: orderList,
              orderItemList: orderItemList,
              totalActualCodAmt: route.params?.totalActualCodAmt,
              photoTaking: true,
              isPD: true,
              additionalParamsJson: additionalParamsJson,
            });
          } else {
            const isEsign = true;
            action.additionalParamsJson =
              ActionHelper.generateCODAdditionalParamsJson(
                orderList,
                job,
                route.params?.totalActualCodAmt,
              );

            if (verificationMethod) {
              let additionalParamsJsonAdditional = JSON.parse(
                action.additionalParamsJson,
              );
              additionalParamsJsonAdditional.verificationMethod =
                verificationMethod;

              action.additionalParamsJson = JSON.stringify(
                additionalParamsJsonAdditional,
              );
            }

            await ActionHelper.insertPartialDeliveryActionAndOrderItem(
              job,
              action,
              orderList,
              orderItemList,
              epodRealm,
              isEsign,
            );

            await updatePhotoStatus(action);

            actionSyncAndRefreshJobList();
          }
          isProcessSuccess = true;
        } else if (
          action.actionType === Constants.ActionType.ESIGNBARCODE_POD
        ) {
          let tempAction = action
            ? action
            : ActionHelper.generateActionModel(
                job.id,
                stepCode,
                true,
                locationModel,
                null,
                photoTaking,
              );
          if (orderList && orderList.length > 0) {
            tempAction.orderId = orderList[0].id;
          }

          navigation.navigate('ScanQr', {
            job: job,
            actionModel: tempAction,
            stepCode: stepCode,
            orderList: orderList,
            orderItemList: orderItemList,
            totalActualCodAmt: route.params?.totalActualCodAmt,
            photoTaking: true,
            additionalParamsJson: additionalParamsJson,
          });
        } else {
          const orderList = await OrderRealmManager.getOrderByJodId(
            job.id,
            epodRealm,
          );

          if (orderList && orderList.length > 0) {
            action.orderId = orderList[0].id;
          }
          if (orderItemList.some((item) => item.scanSkuTime !== '')) {
            action.syncItem = Constants.SyncStatus.SYNC_PENDING;
          }

          await addNewAction(action);

          await ActionHelper.insertScanSkuActionAction(
            action,
            orderItemList,
            epodRealm,
          );

          const isSuccess = true;
          const isJobUpdated = await updateJobInLocalDb(
            job,
            stepCode,
            action,
            isSuccess,
          );
          await updatePhotoStatus(action);

          if (isJobUpdated) {
            actionSyncAndRefreshJobList();
          }

          isProcessSuccess = isJobUpdated;
        }
        addEventLog('esign_confirm', {
          esignconfirm: `${userModel.id}; data: ${JSON.stringify(
            action,
          )}; operateAt: operateAt: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        });
      })
      .catch((err) => {
        isProcessSuccess = false;
        console.log('error: ', err.message);
      });

    return isProcessSuccess;
  };

  const updatePhotoStatus = async (actionModel) => {
    // update photo status for action with photo flow for pending upload
    await PhotoHelper.updatePhotoSyncStatusByAction(actionModel, epodRealm);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
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
      headerTitle: translationString.confirm_sign,
    });
  }, [navigation]);

  return {
    getQuantityText,
    getTotalCODText,
    viewOrderItem,
    closeDialog,
    submitEsignPhoto,
    orderList,
    orderItemList,
    isModalVisible,
    isShowLoadingIndicator,
  };
};
