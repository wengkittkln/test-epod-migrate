import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Image} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelfAssignmentItem} from './useSelfAssignmentItem';

const SelfAssignmentItem = ({
  orderModel,
  job,
  trackNumModel,
  requestTime,
  orderItemList,
}) => {
  const {getTotalQuantity} = useSelfAssignmentItem(orderModel, job);
  return (
    <View style={styles.orderDetailContainer}>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>{translationString.order}</Text>
        <Text style={styles.blueText}>
          {orderModel.orderNumber ? orderModel.orderNumber : ''}
        </Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>
          {translationString.receiver_title}
        </Text>
        <Text style={styles.value}>
          {orderModel.consignee ? orderModel.consignee : ''}
        </Text>
      </View>
      <View style={styles.horizontalContainer}>
        <Text style={styles.orderLabel}>
          {translationString.receiver_contact}
        </Text>
        <Text style={styles.value}>
          {orderModel.contact ? orderModel.contact : ''}
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

      {orderItemList.map((item, index) => (
        <>
          <Text style={styles.orderItem} key={item.id}>
            {index + 1}
            {'.   '}
            {item.description}
          </Text>
          <Text style={styles.actualQunatity}>
            {getTotalQuantity(item)} {item.uom ? item.uom : ''}
          </Text>
        </>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  orderDetailContainer: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'lightgrey',
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    paddingHorizontal: 16,
  },
  blueText: {
    color: '#29B6F6',
    marginBottom: 8,
    flex: 1,
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  orderLabel: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: Constants.Pending_Color,
    flex: 1,
  },
  value: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'black',
    marginBottom: 8,
    flex: 1,
  },
  productLabel: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: 'black',
    flex: 1,
    textDecorationLine: 'underline',
  },
  orderItem: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'black',
    flex: 1,
  },
  actualQunatity: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginVertical: 16,
    color: 'black',
    flex: 1,
  },
});

export default SelfAssignmentItem;
