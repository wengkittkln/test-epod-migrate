import React, {useState, useEffect} from 'react';
import {translationString} from '../../Assets/translation/Translation';
import * as OrderItemHelper from '../../Helper/OrderItemHelper';
import * as OrderHelper from '../../Helper/OrderHelper';

export const useOrderItemsModel = (job, orders, orderItems) => {
  const [orderList, setOrderList] = useState([]);
  const [orderItemList, setOrderItemList] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState('');
  const [totalCOD, setTotalCOD] = useState('-');
  const [totalCollectedCOD, setTotalCollectedCOD] = useState('-');

  useEffect(() => {
    setOrderList(orders);
    setOrderItemList(orderItems);
  });

  useEffect(() => {
    getTotalCODValue();
  }, [totalCOD]);

  useEffect(() => {
    getTotalQuantity();
  }, [orderItemList]);

  useEffect(() => {
    getTotalCOD();
  }, [orderList]);

  const getTotalQuantityPerItem = (item) => {
    let expectedQuantity = 0;
    let quantity = 0;

    expectedQuantity = expectedQuantity + item.expectedQuantity; //Total quantity
    quantity = quantity + item.quantity; // delivery count

    return quantity + '/' + expectedQuantity;
  };

  const getTotalCODValue = () => {
    const result =
      orderList &&
      orderList.length > 0 &&
      orderList[0].codCurrency &&
      orderList[0].codCurrency.length > 0
        ? orderList[0].codCurrency + ' ' + totalCOD
        : totalCOD;

    return translationString.signed_cod + ' (' + result + ')';
  };

  const getCollectedCODValue = () => {
    return totalCollectedCOD;
  };
  const getTotalQuantity = () => {
    const result = OrderItemHelper.getTotalQuantity(orderItemList);
    setTotalQuantity(result);
  };

  const getTotalCOD = () => {
    const result = OrderHelper.getTotalCOD(orderList);
    setTotalCOD(result);

    return result;
  };

  const getCODPerOrder = (item) => {
    const result =
      item.codCurrency && item.codCurrency.length > 0
        ? item.codCurrency + ' ' + item.codAmount
        : item.codAmount;

    return translationString.formatString(
      translationString.expected_cod,
      result,
    );
  };

  const getCollectedCODPerOrder = (item) => {
    return item.codAmount;
  };

  return {
    totalQuantity,
    getTotalQuantityPerItem,
    getTotalCODValue,
    getCollectedCODValue,
    getCODPerOrder,
    getCollectedCODPerOrder,
  };
};
