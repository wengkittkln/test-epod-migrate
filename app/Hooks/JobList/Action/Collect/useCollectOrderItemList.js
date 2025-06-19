/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect, useRef} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import * as Constants from '../../../../CommonConfig/Constants';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import AddButton from '../../../../Assets/image/icon_add_product.png';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';

export const useCollectOrderItemList = (route, navigation) => {
  const job = route.params.job;
  const stepCode = route.params.stepCode;
  // use to define photo taking flow else it is normal collection
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;

  const networkModel = useSelector((state) => state.NetworkReducer);
  const locationModel = useSelector((state) => state.LocationReducer);
  const {epodRealm} = React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [orderItemList, setOrderItemList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [isFailConfirmModalVisible, setFailConfirmModalVisible] =
    useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [existingActionModel, setExistingActionModel] = useState(
    route.params?.actionModel,
  );
  const dispatch = useDispatch();
  const ref = useRef(null);

  const showHideDialog = (visible) => {
    setModalVisible(visible);
  };

  const closeDialog = () => {
    dispatch(createAction(ActionType.ORDER_ITEM_RESET));
    showHideDialog(false);
  };

  const minusButtonOnPressed = (item, index) => {
    let tempOrderItemList = orderItemList;

    if (item.quantity <= 0) {
      item.quantity = 0;
    } else {
      item.quantity -= 1;
    }

    tempOrderItemList = [
      ...tempOrderItemList.slice(0, index),
      item,
      ...tempOrderItemList.slice(index + 1),
    ];
    setOrderItemList(tempOrderItemList);
    setTotal(total - 1);
  };

  const addButtonOnPressed = (item, index) => {
    let tempOrderItemList = orderItemList;
    item.quantity += 1;

    tempOrderItemList = [
      ...tempOrderItemList.slice(0, index),
      item,
      ...tempOrderItemList.slice(index + 1),
    ];
    setOrderItemList(tempOrderItemList);
    setTotal(total + 1);
  };

  const onQuantityTextInputOnChange = (text, item, index) => {
    let tempOrderItemList = orderItemList;
    if (text === '') {
      item.quantity = 0;
    } else {
      let inputQuantity = parseInt(text);
      item.quantity = inputQuantity;
    }
    tempOrderItemList = [
      ...tempOrderItemList.slice(0, index),
      item,
      ...tempOrderItemList.slice(index + 1),
    ];
    setOrderItemList(tempOrderItemList);
    const tempTotal = tempOrderItemList.reduce(
      (accumulator, current) => accumulator + current.quantity,
      0,
    );
    setTotal(tempTotal);
  };

  const initValue = async () => {
    let tempOrderList = [];
    let tempOrderItemList = [];
    let tempTotalSum = 0;
    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );

    if (orderList && orderList.length > 0) {
      orderList.map((orderModel) => {
        const tempOrderModel =
          GeneralHelper.convertRealmObjectToJSON(orderModel);
        tempOrderList.push(tempOrderModel);

        const seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
          orderModel.id,
          epodRealm,
        );

        seletedOrderItems.map((item, index) => {
          let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
          orderItemModel.quantity = item.expectedQuantity;
          orderItemModel.key = index;

          if (orderItemModel.quantity && orderItemModel.quantity >= 0) {
            orderItemModel.expectedQuantity = orderItemModel.quantity;
            orderItemModel.orderNumber = orderModel.orderNumber;
            tempOrderItemList.push(orderItemModel);
            tempTotalSum += orderItemModel.quantity;
          }
        });
      });
      setOrderList(tempOrderList);
      setOrderItemList(tempOrderItemList);
      setTotal(tempTotalSum);
    }
  };

  useEffect(() => {
    initValue();
  }, []);

  const addOrderItem = (orderItemModel) => {
    if (orderItemModel && orderItemModel.id === 0) {
      orderItemModel.id = Math.floor(Date.now() / 1000);
    }
    if (
      orderList &&
      orderList.length > 0 &&
      orderItemModel &&
      orderItemModel.orderId === 0
    ) {
      orderItemModel.orderId = orderList[0].id;
      orderItemModel.key = orderItemList.length;
    }

    const orderItem = OrderItemRealmManager.getOrderItemById(
      orderItemModel,
      epodRealm,
    );

    let tempOrderItemList = orderItemList;

    if (orderItem) {
      orderItemList.map((itemModel, index) => {
        if (itemModel.id === orderItemModel.id) {
          tempOrderItemList[index] = orderItemModel;
        }
      });
      OrderItemRealmManager.updateOrderItemById(orderItemModel, epodRealm);
    } else {
      OrderItemRealmManager.insertNewOrderItem(orderItemModel, epodRealm);
      tempOrderItemList.push(orderItemModel);
    }

    setOrderItemList(tempOrderItemList);
    showHideDialog(false);

    closeAllRows();
    dispatch(createAction(ActionType.ORDER_ITEM_RESET));
  };

  const editOrderItem = (item) => {
    let payload = item;
    showHideDialog(true);
    dispatch(createAction(ActionType.UPDATE_ORDER_ITEM, payload));
  };

  const deleteOrderItem = (item, index) => {
    let tempOrderItemList = orderItemList;
    tempOrderItemList = [
      ...tempOrderItemList.slice(0, index),
      ...tempOrderItemList.slice(index + 1),
    ];
    setOrderItemList(tempOrderItemList);
    closeAllRows();

    OrderItemRealmManager.deleteOrderItem(item, epodRealm);
  };

  const closeAllRows = () => {
    ref.current.closeAllOpenRows();
  };

  const showHideFailConfirmDialog = (visible) => {
    setFailConfirmModalVisible(visible);
  };

  const closeFailConfirmDialog = () => {
    showHideFailConfirmDialog(false);
  };

  const showFailCollectModal = () => {
    showHideFailConfirmDialog(true);
  };

  const failCollect = () => {
    let isSuccess = false;
    let action = ActionHelper.generateActionModel(
      job.id,
      stepCode,
      isSuccess,
      locationModel,
    );

    let tempPendingActionList = [];
    tempPendingActionList.push(action);
    AsyncStorage.setItem(
      Constants.PENDING_ACTION_LIST,
      JSON.stringify(tempPendingActionList),
    );

    navigation.navigate('SelectReason', {
      job: job,
      reasonType: Constants.ReasonType.COLLECT_EX_REASON,
      actionModel: action,
      stepCode: stepCode,
      photoTaking: photoTaking,
    });
  };

  const showHideSuccessConfirmDialog = (visible) => {
    setSuccessModalVisible(visible);
  };

  const closeSuccessConfirmDialog = () => {
    showHideSuccessConfirmDialog(false);
  };

  const showSuccessCollectModal = () => {
    showHideSuccessConfirmDialog(true);
  };

  const collectConfirmOnPress = async () => {
    let isSuccess = true;
    let actionModel = existingActionModel
      ? existingActionModel
      : ActionHelper.generateActionModel(
          job.id,
          stepCode,
          isSuccess,
          locationModel,
        );

    if (job.codAmount && job.codAmount > 0) {
      let tempPendingActionList = [];
      tempPendingActionList.push(actionModel);
      AsyncStorage.setItem(
        Constants.PENDING_ACTION_LIST,
        JSON.stringify(tempPendingActionList),
      );

      navigation.navigate('CodAction', {
        job: job,
        stepCode: stepCode,
        actionModel: actionModel,
        orderItemList: orderItemList,
        orderList: orderList,
        photoTaking: photoTaking,
      });
    } else {
      await ActionHelper.insertCollectActionAndOrderItem(
        job,
        actionModel,
        orderList,
        orderItemList,
        epodRealm,
      );

      if (photoTaking) {
        // update photo status for action with photo flow for pending upload
        await PhotoHelper.updatePhotoSyncStatusByAction(actionModel, epodRealm);
      }

      closeSuccessConfirmDialog();
      actionSyncAndRefreshJobList();
    }
  };

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
    navigation.navigate('MainTab');
  };

  const getConfirmPickUpMessage = () => {
    let tempOrderItemList = orderItemList;
    let quantity = 0;

    if (tempOrderItemList) {
      tempOrderItemList.map((item) => {
        quantity += item.quantity;
      });
    }

    return translationString.formatString(
      translationString.are_you_confirm_pickup_item,
      quantity.toString(),
    );
  };

  const getItemDescription = (item) => {
    return item.isAddedFromLocal
      ? item.description
      : item.description + ' (' + item.expectedQuantity + ' ' + item.uom + ')';
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#F8F8F8',
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
          <Image style={{tintColor: 'black'}} source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            showHideDialog(true);
          }}>
          <Image source={AddButton} />
        </TouchableOpacity>
      ),
      headerTitle: translationString.confirm_pickup_item,
    });
  }, [navigation]);

  return {
    closeDialog,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    addOrderItem,
    editOrderItem,
    deleteOrderItem,
    closeFailConfirmDialog,
    showFailCollectModal,
    failCollect,
    closeSuccessConfirmDialog,
    collectConfirmOnPress,
    getConfirmPickUpMessage,
    showSuccessCollectModal,
    getItemDescription,
    ref,
    locationModel,
    isModalVisible,
    orderItemList,
    isFailConfirmModalVisible,
    isSuccessModalVisible,
    total,
  };
};
