/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import moment from 'moment';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import * as Constants from '../../../../CommonConfig/Constants';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import hexToRgba from 'hex-to-rgba';

export const usePartialDeliveryAction = (route, navigation) => {
  const job = route.params.job;
  const stepCode = route.params.stepCode;
  // use to define photo taking flow else it is normal flow
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;

  const needScanSku = route.params.needScanSku;

  const networkModel = useSelector((state) => state.NetworkReducer);
  const locationModel = useSelector((state) => state.LocationReducer);
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const [actionModel, setActionModel] = useState(route.params.actionModel);
  const [orderList, setOrderList] = useState([]);
  const [orderItemList, setOrderItemList] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [total, setTotal] = useState(0);
  const dispatch = useDispatch();

  const isSkipSummary = route.params?.isSkipSummary
    ? route.params?.isSkipSummary
    : false;

  let skipSummaryOrderItem = [];

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
  };

  const completeButtonOnPressed = async (skipItems = null) => {
    const tempitem = skipItems === null ? orderItemList : skipItems;
    if (needScanSku) {
      const allWithoutSku = tempitem.every((e) => !e.skuCode);
      if (allWithoutSku) {
        const emptyScannedSkuItems = tempitem.map((e) => {
          return {
            ...e,
            isSkuScanned: !e.skuCode ? true : false,
            scanSkuTime: moment().format(),
          };
        });
        navigation.navigate('ScanSkuItems', {
          job: job,
          actionModel: actionModel,
          photoTaking: photoTaking,
          stepCode: stepCode,
          orderList: orderList,
          orderItems: emptyScannedSkuItems,
          isPD: true,
        });
      }
    } else if (JobHelper.isCOD(job)) {
      navigation.navigate('CodAction', {
        job: job,
        stepCode: stepCode,
        actionModel: actionModel,
        orderItemList: tempitem,
        orderList: orderList,
        photoTaking: photoTaking,
        isPD: true,
      });
    } else {
      if (stepCode === Constants.StepCode.BARCODE_POD) {
        AsyncStorage.setItem(
          Constants.PENDING_ACTION_LIST,
          JSON.stringify(actionModel),
        );
        navigation.navigate('ScanQr', {
          job: job,
          isPD: true,
          actionModel: actionModel,
          stepCode: stepCode,
          orderItemList: tempitem,
          orderList: orderList,
          photoTaking: photoTaking,
        });
      } else if (stepCode === Constants.StepCode.ESIGN_POD) {
        navigation.navigate('Esign', {
          job: job,
          action: actionModel,
          stepCode: stepCode,
          orderList: orderList,
          orderItemList: tempitem,
          photoTaking: photoTaking,
        });
      } else if (stepCode === Constants.StepCode.ESIGNBARCODE_POD) {
        navigation.navigate('Esign', {
          job: job,
          action: actionModel,
          stepCode: stepCode,
          orderList: orderList,
          orderItemList: tempitem,
          photoTaking: photoTaking,
          isPD: true,
        });
      } else if (stepCode === Constants.StepCode.BARCODEESIGN_POD) {
        navigation.navigate('ScanQr', {
          job: job,
          action: actionModel,
          actionModel: actionModel,
          stepCode: stepCode,
          orderList: orderList,
          orderItemList: tempitem,
          photoTaking: photoTaking,
          isPD: true,
        });
      } else {
        await ActionHelper.insertPartialDeliveryActionAndOrderItem(
          job,
          actionModel,
          orderList,
          tempitem,
          epodRealm,
          false,
          photoTaking,
        );

        if (photoTaking) {
          // update photo status for action with photo flow for pending upload
          await PhotoHelper.updatePhotoSyncStatusByAction(
            actionModel,
            epodRealm,
          );
        }

        actionSyncAndRefreshJobList();
        navigation.popToTop();
      }
    }
  };

  const minusButtonOnPressed = (item, index) => {
    let tempOrderItemList = orderItemList;
    item.quantity -= 1;
    tempOrderItemList[index] = item;
    setOrderItemList(tempOrderItemList);
    setTotal(total - 1);
  };

  const addButtonOnPressed = (item, index) => {
    let tempOrderItemList = orderItemList;
    item.quantity += 1;
    tempOrderItemList[index] = item;
    setOrderItemList(tempOrderItemList);
    setTotal(total + 1);
  };

  const onQuantityTextInputOnChange = (text, item, index) => {
    let tempOrderItemList = orderItemList;
    let tempTotal = 0;
    if (text === '') {
      item.quantity = 0;
      tempOrderItemList[index] = item;
      tempOrderItemList.map((orderItem) => {
        tempTotal += orderItem.quantity;
      });
      setOrderItemList(tempOrderItemList);
      setTotal(tempTotal);
    } else {
      let inputQuantity = parseInt(text);
      if (inputQuantity && inputQuantity <= item.expectedQuantity) {
        item.quantity = inputQuantity;
        tempOrderItemList[index] = item;
        tempOrderItemList.map((orderItem) => {
          tempTotal += orderItem.quantity;
        });
        setOrderItemList(tempOrderItemList);
        setTotal(tempTotal);
      }
    }
  };

  const initValue = async () => {
    let tempOrderList = [];
    let tempOrderItemList = [];
    let normalSku = [];
    let expensiveSku = [];
    let containerSku = [];

    let tempTotalSum = 0;
    let tempTotal = 0;
    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );

    if (orderList && orderList.length > 0) {
      let tempActionModel = actionModel;
      tempActionModel.orderId = orderList[0].id;
      setActionModel(tempActionModel);

      orderList.map((orderModel) => {
        const tempOrderModel =
          GeneralHelper.convertRealmObjectToJSON(orderModel);
        tempOrderList.push(tempOrderModel);

        let seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
          orderModel.id,
          epodRealm,
        );

        seletedOrderItems = seletedOrderItems.filter(
          (x) => x.sku && x.expectedQuantity > 0,
        );

        seletedOrderItems.map((item) => {
          let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
          orderItemModel.quantity = item.expectedQuantity - item.quantity;
          if (orderItemModel.quantity && orderItemModel.quantity > 0) {
            orderItemModel.expectedQuantity = orderItemModel.quantity;
            if (
              orderItemModel.verifyQuantity !== null ||
              orderItemModel.verifyQuantity !== undefined
            ) {
              orderItemModel.quantity = orderItemModel.verifyQuantity;
              tempTotal += orderItemModel.verifyQuantity;
            }
            orderItemModel.orderNumber = orderModel.orderNumber;
            if (orderItemModel.isExpensive === true) {
              expensiveSku.push(orderItemModel);
            } else {
              normalSku.push(orderItemModel);
            }

            tempTotalSum += orderItemModel.expectedQuantity;
          }
        });
      });

      let selectedContainer = JobRealmManager.getJobContainersByJobId(
        job.id,
        epodRealm,
      );

      if (selectedContainer && selectedContainer.length > 0) {
        selectedContainer.map((item) => {
          let containerItemModel = GeneralHelper.convertRealmObjectToJSON(item);
          containerItemModel.quantity = item.expectedQuantity - item.quantity;
          if (containerItemModel.quantity && containerItemModel.quantity > 0) {
            containerItemModel.expectedQuantity = containerItemModel.quantity;
            if (
              containerItemModel.verifyQuantity !== null ||
              containerItemModel.verifyQuantity !== undefined
            ) {
              containerItemModel.quantity = containerItemModel.verifyQuantity;
              tempTotal += containerItemModel.verifyQuantity;
            }
            containerItemModel.orderNumber = '';
            containerSku.push(containerItemModel);
            tempTotalSum += containerItemModel.expectedQuantity;
          }
        });
      }

      if (expensiveSku) {
        tempOrderItemList.push(...expensiveSku);
      }

      if (containerSku) {
        tempOrderItemList.push(...containerSku);
      }

      tempOrderItemList.push(...normalSku);

      setOrderList(tempOrderList);
      setTotalSum(tempTotalSum);
      setTotal(tempTotal);
      setOrderItemList(tempOrderItemList);

      if (isSkipSummary) {
        completeButtonOnPressed(tempOrderItemList);
      }
    }
  };

  const getExpensiveColor = () => {
    let expensiveColor = 'transparent';

    if (job.customer && job.customer.customerConfigurations) {
      const expensiveConfig = job.customer.customerConfigurations.find(
        (x) => x.tagName === 'EXPENSIVE',
      );

      if (expensiveConfig && expensiveConfig.tagColour) {
        expensiveColor = hexToRgba(expensiveConfig.tagColour, 0.2);
      }
    }

    return expensiveColor;
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
    });
  }, [navigation]);

  useEffect(() => {
    initValue();
  }, []);

  return {
    completeButtonOnPressed,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    getExpensiveColor,
    orderItemList,
    totalSum,
    total,
  };
};
