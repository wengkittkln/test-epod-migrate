/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import {translationString} from '../../../../Assets/translation/Translation';
import * as Constants from '../../../../CommonConfig/Constants';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import {IndexContext} from '../../../../Context/IndexContext';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import {OrderItem, VerifyOrderList} from '../../../../Model/Order';
import store from '../../../../Reducers';
import {Network} from './../../../../Model/Network';
import hexToRgba from 'hex-to-rgba';

export const useQuantityVerifyAction = (route, navigation) => {
  const job = route.params.job;
  const {epodRealm} = React.useContext(IndexContext);
  const networkModel = useSelector<typeof store>(
    (state) => state.NetworkReducer,
  ) as Network;
  const locationModel = useSelector<typeof store>(
    (state) => state.LocationReducer,
  ) as Location;
  const [orderItemList, setOrderItemList] = useState(<Array<OrderItem>>[]);
  const [orderList, setOrderList] = useState(<Array<VerifyOrderList>>[]);
  const [orderListBackup, setOrderListBackup] = useState(
    <Array<VerifyOrderList>>[],
  );
  const [nextStepOrderList, setnextStepOrderList] = useState(<Array<any>>[]);
  // let orderListBackup: VerifyOrderList[] = [];
  const [totalSum, setTotalSum] = useState(0);
  const [total, setTotal] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isShowSummary, setIsShowSummary] = useState(false);
  const [needSummary, setNeedSummary] = useState(false);

  const dispatch = useDispatch();

  const completeButtonOnPressed = async () => {
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    if (needSummary && !isShowSummary) {
      setIsShowSummary(true);
      return;
    }

    if (total === totalSum) {
      JobHelper.gotoDetailScreen(job, true, false);
    } else {
      for (var i of orderItemList) {
        OrderItemRealmManager.updateOrderItemVerifyQuantityId(i, epodRealm);
      }

      let actionModel = ActionHelper.generateActionModel(
        job.id,
        step.stepCode,
        false,
        locationModel,
      );

      actionModel.actionType = Constants.ActionType.PARTIAL_DLEIVER_FAIL;
      actionModel.reasonDescription = translationString.partial_delivery;

      navigation.navigate('PartialDeliveryReason', {
        job: job,
        reasonType: Constants.ReasonType.PARTIAL_DELIVERY_EX_REASON,
        actionModel: actionModel,
        stepCode: step.stepCode,
        needScanSku: step.needScanSku,
        itemList: orderItemList,
        isSkipSummary: true,
      });
    }
  };

  const minusButtonOnPressed = (
    item: OrderItem,
    index: number,
    parentIndex: number,
  ) => {
    setIsDisabled(true);
    const order = orderList[parentIndex];
    // const orderBackup = orderListBackup[parentIndex];

    // const childIndex = order.item.findIndex(x => x.sku === item.sku);

    order.item[index].verifyQuantity -= 1;

    setTotal(total - 1);
    setIsDisabled(false);
    // setOrderListBackup(orderList);
  };

  const addButtonOnPressed = (
    item: OrderItem,
    index: number,
    parentIndex: number,
  ) => {
    setIsDisabled(true);
    const order = orderList[parentIndex];
    // const orderBackup = orderListBackup[parentIndex];

    order.item[index].verifyQuantity += 1;
    // orderBackup.item[index].quantity += 1;

    setTotal(total + 1);
    setIsDisabled(false);
    // setOrderListBackup(orderList);
  };

  const onQuantityTextInputOnChange = (
    text: any,
    item: OrderItem,
    index: number,
    parentIndex: number,
  ) => {
    const order = orderList[parentIndex];
    const orderBackup = orderListBackup[parentIndex];

    setIsDisabled(true);
    let tempTotal = 0;
    if (text === '') {
      order.item[index].verifyQuantity = 0;

      orderBackup.item[index].verifyQuantity = 0;
      orderBackup.item.map((orderItem) => {
        tempTotal += orderItem.verifyQuantity;
      });
      setTotal(tempTotal);
    } else {
      let inputQuantity = parseInt(text);
      if (inputQuantity && inputQuantity <= item.expectedQuantity) {
        order.item[index].verifyQuantity = inputQuantity;

        orderBackup.item[index].verifyQuantity = inputQuantity;
        orderBackup.item.map((orderItem) => {
          tempTotal += orderItem.verifyQuantity;
        });
        setTotal(tempTotal);
      }
    }
    setIsDisabled(false);
    // setOrderListBackup(orderList);
  };

  const initValue = async () => {
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    if (step.stepNeedSummary && !isShowSummary) {
      setNeedSummary(true);
    }

    let expensiveColorRGBA = 'transparent';
    let expensiveColor = 'transparent';

    if (job.customer && job.customer.customerConfigurations) {
      const expensiveConfig = job.customer.customerConfigurations.find(
        (x: any) => x.tagName === 'EXPENSIVE',
      );

      if (expensiveConfig && expensiveConfig.tagColour) {
        expensiveColor = expensiveConfig.tagColour;
        expensiveColorRGBA = hexToRgba(expensiveConfig.tagColour, 0.2);
      }
    }

    let tempOrderItemList: OrderItem[] = [];
    let tempOrderList: any[] = [];
    let normalSku: OrderItem[] = [];
    let expensiveSku: OrderItem[] = [];
    let containerSku: OrderItem[] = [];

    let tempTotalSum = 0;
    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );

    if (orderList && orderList.length > 0) {
      orderList.map((orderModel: any) => {
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

        seletedOrderItems.map((item: any) => {
          let orderItemModel = GeneralHelper.convertRealmObjectToJSON(
            item,
          ) as OrderItem;

          orderItemModel.verifyQuantity = item.expectedQuantity - item.quantity;

          if (orderItemModel.isExpensive) {
            orderItemModel.backgroundColor = expensiveColorRGBA;
            orderItemModel.textColor = expensiveColor;
          } else {
            orderItemModel.backgroundColor = 'transparent';
            orderItemModel.textColor = '#000';
          }

          orderItemModel.quantity = item.expectedQuantity - item.quantity;
          if (
            orderItemModel.expectedQuantity &&
            orderItemModel.expectedQuantity > 0
          ) {
            orderItemModel.expectedQuantity = orderItemModel.quantity;
            orderItemModel.orderNumber = orderModel.orderNumber;

            if (orderItemModel.isExpensive === true) {
              expensiveSku.push(orderItemModel);
            } else {
              normalSku.push(orderItemModel);
            }

            tempTotalSum += orderItemModel.verifyQuantity;
          }
        });
      });

      let selectedContainer = JobRealmManager.getJobContainersByJobId(
        job.id,
        epodRealm,
      );

      if (selectedContainer) {
        selectedContainer = selectedContainer.filter(() => true);

        selectedContainer.map((item: any) => {
          let containerItemModel = GeneralHelper.convertRealmObjectToJSON(
            item,
          ) as OrderItem;

          containerItemModel.verifyQuantity =
            item.expectedQuantity - item.quantity;
          containerItemModel.backgroundColor = 'transparent';
          containerItemModel.textColor = '#000';
          containerItemModel.quantity = item.expectedQuantity - item.quantity;
          if (
            containerItemModel.expectedQuantity &&
            containerItemModel.expectedQuantity > 0
          ) {
            containerItemModel.expectedQuantity = containerItemModel.quantity;
            containerItemModel.orderNumber = '_Container_';
            containerSku.push(containerItemModel);
            tempTotalSum += containerItemModel.verifyQuantity;
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

      const groupResult = groupBy(tempOrderItemList, (i) => i.orderNumber);
      const normalSkuResult: VerifyOrderList[] = [];
      const expensiveSkuResult: VerifyOrderList[] = [];
      const containerGroupResult: VerifyOrderList[] = [];
      const sortedGroupResult: VerifyOrderList[] = [];

      for (const i of groupResult) {
        if (i.orderNumber === '_Container_') {
          containerGroupResult.push(i);
        } else {
          const isExpensive =
            i.item.filter((x) => x.isExpensive === true).length > 0;
          if (isExpensive) {
            expensiveSkuResult.push(i);
          } else {
            normalSkuResult.push(i);
          }
        }
      }
      if (expensiveSkuResult) {
        sortedGroupResult.push(...expensiveSkuResult);
      }

      if (containerGroupResult) {
        sortedGroupResult.push(...containerGroupResult);
      }
      sortedGroupResult.push(...normalSkuResult);

      // for (var i of groupResult) {
      //   if (i.orderNumber !== '_Container_') {
      //     const isIncludeExpensiveItem = i.item.findIndex(
      //       (x) => x.isExpensive === true,
      //     );
      //     if (isIncludeExpensiveItem) {
      //       sortedGroupResult.unshift(i);
      //     } else {
      //       sortedGroupResult.push(i);
      //     }
      //   }
      // }

      // sortedGroupResult.push(...containerGroupResult);

      setOrderList(sortedGroupResult);
      setnextStepOrderList(tempOrderList);
      setOrderItemList(tempOrderItemList);
      // setOrderListBackup(deepCopy);
      // orderListBackup = groupResult;
      setOrderListBackup(sortedGroupResult);
      setTotalSum(tempTotalSum);
      setTotal(tempTotalSum);
    }
  };

  const groupBy = (arr: OrderItem[], key: (i: OrderItem) => string) => {
    return arr.reduce((groups, item) => {
      const orderNumber = key(item);

      const group: VerifyOrderList = {
        id: 0,
        orderNumber: key(item),
        item: [item],
      };

      if (!groups || !Array.isArray(groups)) groups = [];
      const index = groups.findIndex((x) => x.orderNumber === orderNumber);

      if (index === -1) {
        groups.push(group);
      } else {
        groups[index].item.push(item);
      }
      return groups;
    }, {} as VerifyOrderList[]);
  };

  const searchItem = (input: string) => {
    console.log(orderListBackup.length);
    if (input.trim() === '') {
      setOrderList(orderListBackup);
      return;
    }

    const filteredResult: VerifyOrderList[] = [];

    input = input.toLocaleLowerCase();

    for (var i of orderListBackup) {
      const filteredItems = i.item.filter(
        (x) =>
          x.description.toLocaleLowerCase().includes(input) ||
          x.sku.toLocaleLowerCase().includes(input),
      );

      if (filteredItems) {
        const order: VerifyOrderList = {
          id: 0,
          orderNumber: i.orderNumber,
          item: filteredItems,
        };

        filteredResult.push(order);
      }
    }
    setOrderList(filteredResult);
  };

  const cancelConfirm = () => {
    setIsShowSummary(false);
  };

  const backOnPress = (isShow: boolean) => {
    if (isShow) {
      console.log('isshow');
      setIsShowSummary(false);
    } else {
      console.log('noshow');
      navigation.goBack();
    }
  };

  // const groupBy2 = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  //   arr.reduce((groups, item) => {
  //     (groups[key(item)] ||= []).push(item);
  //     return groups;
  //   }, {} as Record<K, T[]>);

  useEffect(() => {
    initValue();
  }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const step = JobHelper.getStepCodeByJobId(
  //       job.customer,
  //       job.id,
  //       job.jobType,
  //       epodRealm,
  //     );

  //     if (
  //       step &&
  //       step.stepCode &&
  //       step.stepCode !== Constants.StepCode.VERIFY_QTY
  //     ) {
  //       navigation.popToTop();
  //     }
  //   }, []),
  // );

  return {
    completeButtonOnPressed,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    searchItem,
    cancelConfirm,
    backOnPress,
    totalSum,
    total,
    isDisabled,
    orderList,
    showSummary,
    job,
    orderItemList,
    isShowSummary,
    needSummary,
    orderListBackup,
  };
};
