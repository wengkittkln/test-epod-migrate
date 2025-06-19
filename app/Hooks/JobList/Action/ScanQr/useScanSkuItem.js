import React, {useState, useEffect, useLayoutEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {translationString} from '../../../../Assets/translation/Translation';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import * as Constants from '../../../../CommonConfig/Constants';
import {TouchableOpacity, Image} from 'react-native';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as PhotoRealmManager from '../../../../Database/realmManager/PhotoRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import {IndexContext} from '../../../../Context/IndexContext';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';

export const useScanSkuItem = (route, navigation) => {
  const [actionModel, setActionModel] = useState(route.params.actionModel);
  const photoTaking = route.params.photoTaking;
  const stepCode = route.params.stepCode;
  const job = route.params.job;
  const orderList = route.params.orderList;
  const isPD = route.params?.isPD ? route.params.isPD : false;
  const isPartialDelivery = route.params.isPartialDelivery;
  const [orderItems, setOrderItems] = useState(route.params.orderItems);
  const itemsWithoutSkuCode = route.params.orderItems.filter((e) => !e.skuCode);
  const itemsWithSkuCode = route.params.orderItems.filter((e) => e.skuCode);
  const sortedList = itemsWithSkuCode.sort((a, b) => b.skuCode - a.skuCode);
  const newJoinedList = [...sortedList, ...itemsWithoutSkuCode];
  const [scannedOrderItems, setScannedOrderItems] = useState(
    newJoinedList.filter((orderItem) => orderItem.scannedCount > 0),
  );
  const [disabledContinue, setDisableContinue] = useState(
    isPD ? false : !orderItems.every((item) => item.isSkuScanned),
  );
  const [emptyItemDisplay, setEmptyItem] = useState(
    orderItems.some((item) => item.scannedCount > 0),
  );
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const {startActionSync} = React.useContext(ActionSyncContext);

  const dispatch = useDispatch();

  const continueButtonOnPressed = async () => {
    actionModel.needScanSku = true;
    let seletedOrderItems = scannedOrderItems;
    let selectedContainer = JobRealmManager.getJobContainersByJobId(
      job.id,
      epodRealm,
    );

    if (selectedContainer && selectedContainer.length > 0) {
      for (var i of selectedContainer) {
        const container = GeneralHelper.convertRealmObjectToJSON(i);
        container.quantity = i.expectedQuantity - i.quantity;
        container.expectedQuantity = container.quantity;
        container.scannedCount = container.quantity;

        seletedOrderItems.push(container);
      }
    }

    const scannedOrderItemsOutput = seletedOrderItems.map((item) => {
      return {
        ...item,
        quantity: item.scannedCount,
      };
    });

    if (job.codAmount && job.codAmount > 0) {
      if (isPartialDelivery) {
        navigation.navigate('CodAction', {
          job: job,
          stepCode: stepCode,
          orderList: orderList,
          actionModel: actionModel,
          photoTaking: photoTaking,
          scannedOrderItems: scannedOrderItemsOutput,
          orderItemList: scannedOrderItemsOutput,
        });
      } else {
        navigation.navigate('CodAction', {
          job: job,
          stepCode: stepCode,
          orderList: orderList,
          actionModel: actionModel,
          photoTaking: photoTaking,
          scannedOrderItems: scannedOrderItemsOutput,
        });
      }
    } else {
      switch (stepCode) {
        case Constants.StepCode.BARCODE_POD:
        case Constants.StepCode.BARCODEESIGN_POD:
          navigation.navigate('ScanQr', {
            job: job,
            stepCode: stepCode,
            orderList: orderList,
            actionModel: actionModel,
            photoTaking: photoTaking,
            orderItemList: scannedOrderItemsOutput,
          });
          break;

        case Constants.StepCode.ESIGN_POD:
        case Constants.StepCode.ESIGNBARCODE_POD:
          navigation.navigate('Esign', {
            job: job,
            stepCode: stepCode,
            action: actionModel,
            photoTaking: photoTaking,
            orderList: orderList,
            orderItemList: scannedOrderItemsOutput,
          });
          break;

        default:
          if (isPD) {
            await ActionHelper.insertPartialDeliveryActionAndOrderItem(
              job,
              actionModel,
              orderList,
              scannedOrderItemsOutput,
              epodRealm,
              false,
              photoTaking,
            );
          } else {
            await ActionHelper.insertScanSkuActionActionAndOrderItem(
              job,
              actionModel,
              orderList,
              scannedOrderItemsOutput,
              epodRealm,
              false,
              photoTaking,
            );
          }

          const isJobUpdated = await updateJobInLocalDb(
            job,
            stepCode,
            actionModel,
            true,
          );

          if (photoTaking) {
            updatePhotoSyncStatusByAction();
          }

          if (isJobUpdated) {
            actionSyncAndRefreshJobList();
          }

          let payload = {
            isRefresh: true,
          };
          dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
          navigation.popToTop();

          break;
      }
    }
  };

  const updatePhotoSyncStatusByAction = () => {
    try {
      PhotoRealmManager.updatePhotoSyncStatusByAction(
        actionModel.guid,
        Constants.SyncStatus.SYNC_PENDING,
        epodRealm,
      );
    } catch (error) {
      alert('Update Photo SyncStatus: ' + error);
    }
  };

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };

    AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    navigation.popToTop();
  };

  const updateJobInLocalDb = async (
    jobModel,
    currentStepCode,
    actionModel,
    isSuccess,
  ) => {
    try {
      JobHelper.updateJob(
        jobModel,
        currentStepCode,
        actionModel,
        isSuccess,
        epodRealm,
      );
      return true;
    } catch (error) {
      alert('Update Job Error: ' + error);
      return false;
    }
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
      headerTitle: translationString.item_detail,
    });
  }, [navigation]);

  const deleteScannedItem = (item) => {
    item.isSkuScanned = false;
    const position = orderItems.findIndex(
      (orderItem) => orderItem.id === item.id,
    );
    const updatedScannedItems = [
      ...orderItems.slice(0, position),
      {...item, scannedCount: 0},
      ...orderItems.slice(position + 1),
    ];
    setScannedOrderItems(updatedScannedItems.filter((e) => e.scannedCount > 0));
    setEmptyItem(orderItems.some((item) => item.scannedCount > 0));
    setDisableContinue(
      isPD ? false : !orderItems.every((item) => item.isSkuScanned),
    );
    const payload = {
      orderItems: updatedScannedItems,
      isRefresh: false,
    };
    dispatch(createAction(ActionType.UPDATE_SKU_ORDER_ITEMS, payload));
  };

  return {
    scannedOrderItems,
    deleteScannedItem,
    orderItems,
    continueButtonOnPressed,
    disabledContinue,
    emptyItemDisplay,
    isPD,
  };
};
