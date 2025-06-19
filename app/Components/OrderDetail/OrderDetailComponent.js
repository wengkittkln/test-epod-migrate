/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import {useOrderDetailComponent} from './useOrderDetailComponent';

const GenerateItemList = (item, index, getTotalQuantity) => {
  if (item && item.isContainer) {
    return (
      <View key={item.id}>
        <Text style={styles.orderItem}>
          {index + 1}
          {'.   '}
          {item.sku}
        </Text>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <Text style={styles.actualQunatity}>{getTotalQuantity(item)}</Text>
        </View>
      </View>
    );
  } else {
    return (
      <View key={item.id}>
        <Text style={styles.orderItem}>
          {index + 1}
          {'.   '}
          {item.description}
        </Text>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <Text style={styles.actualQunatity}>
            {getTotalQuantity(item)} {item.uom ? item.uom : ''}
          </Text>
          <Text style={{...styles.actualQunatity, marginLeft: 15}}>
            {translationString.formatString(
              translationString.total_weight,
              item.weight,
            )}
          </Text>
        </View>
      </View>
    );
  }
};

const OrderDetailComponent = ({
  orderModel,
  job,
  trackNumModel,
  requestTime,
  isShowDecrypt,
}) => {
  const {
    orderItemList,
    getTotalQuantity,
    isShowDecryptOrder,
    decryptedConsignee,
    decryptedContact,
    getDecryptData,
    setIsShowDecryptOrder,
  } = useOrderDetailComponent(orderModel, job);

  useEffect(() => {
    if (isShowDecrypt) {
      getDecryptData();
    } else {
      setIsShowDecryptOrder(false);
    }
  }, [isShowDecrypt]);

  return (
    <View style={styles.orderDetailContainer}>
      <Text
        style={[
          styles.blueText,
          {
            textDecorationLine: trackNumModel.isUnderline
              ? 'underline'
              : 'none',
          },
        ]}>
        {trackNumModel.trackingNum}
      </Text>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>{translationString.order}</Text>
        <Text style={styles.value}>
          {orderModel.orderNumber ? orderModel.orderNumber : ''}
        </Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>
          {translationString.receiver_title}
        </Text>
        <Text style={styles.value}>
          {isShowDecryptOrder
            ? decryptedConsignee
            : orderModel.consignee
            ? orderModel.consignee
            : ''}
        </Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>
          {translationString.receiver_contact}
        </Text>
        <Text style={styles.value}>
          {isShowDecryptOrder
            ? decryptedContact
            : orderModel.contact
            ? orderModel.contact
            : ''}
        </Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>{translationString.address_title}</Text>
        <Text style={styles.value}>
          {orderModel.destination ? orderModel.destination : ''}
        </Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>{translationString.request_time}</Text>
        <Text style={styles.value}>{requestTime}</Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>{translationString.cod}</Text>
        <Text style={styles.value}>
          {orderModel.codCurrency ? orderModel.codCurrency : ''}{' '}
          {orderModel.codAmount ? orderModel.codAmount.toFixed(2) : ''}
        </Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>{translationString.remark}</Text>
        <Text style={styles.value}>
          {orderModel.remark ? orderModel.remark : ''}
        </Text>
      </View>

      <Text style={styles.productLabel}>
        {translationString.order_item_title}
      </Text>
      {orderItemList.map((item, index) =>
        GenerateItemList(item, index, getTotalQuantity),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orderDetailContainer: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'lightgrey',
    marginTop: 10,
    padding: 10,
    paddingHorizontal: 16,
  },
  blueText: {
    color: '#29B6F6',
    marginBottom: 8,
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
  },
  horizontalContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderLabel: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: Constants.Pending_Color,
    width: '40%',
  },
  value: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'black',
    marginBottom: 8,
    width: '60%',
  },
  productLabel: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: 'black',
    textDecorationLine: 'underline',
  },
  orderItem: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'black',
  },
  actualQunatity: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginVertical: 16,
    color: 'black',
  },
});

export default OrderDetailComponent;
