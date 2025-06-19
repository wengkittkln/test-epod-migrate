import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  SectionList,
} from 'react-native';

import {translationString} from '../../Assets/translation/Translation';
import CloseButton from '../../Assets/image/icon_close.png';
import Modal from 'react-native-modal';
import {useOrderItemsModel} from './useOrderItemsModel';
import * as Constants from '../../CommonConfig/Constants';

const OrderItemsModel = ({
  job,
  orders,
  orderItems,
  isModalVisible,
  totalActualCodAmt = '-',
  closeOnPressed = () => {},
}) => {
  const {
    totalQuantity,
    getTotalQuantityPerItem,
    getTotalCODValue,
    getCollectedCODValue,
    getCODPerOrder,
    getCollectedCODPerOrder,
  } = useOrderItemsModel(job, orders, orderItems);

  let dataSectionList = [
    {
      title: translationString.product,
      data: orderItems,
    },
  ];
  const orderData = {
    title: translationString.order,
    data: orders,
  };

  if (job.codAmount && job.codAmount > 0) {
    dataSectionList = dataSectionList.concat(orderData);
  }

  const renderItem = ({item, section, index}) => {
    if (section.title == translationString.product) {
      return <RenderOrderItem orderItem={item} index={index} />;
    } else {
      return <RenderOrder order={item} />;
    }
  };

  //-------------- Order Item view ---------------
  const RenderOrderItem = ({orderItem, index}) => (
    <View style={styles.rowContainer}>
      <Text style={styles.itemTitle}>
        {index + 1}. {orderItem.description}
      </Text>
      <Text style={styles.itemQtyValue}>
        {getTotalQuantityPerItem(orderItem)}
      </Text>
    </View>
  );

  //-------------- Order Item view ---------------
  //-------------- Order  view ---------------
  const RenderOrder = ({order}) => (
    <View>
      <View style={styles.rowContainer}>
        <Text style={styles.itemTitle}>
          {translationString.formatString(
            translationString.order_number,
            order.orderNumber,
          )}
        </Text>
        <Text style={styles.itemQtyValue}>
          {getCollectedCODPerOrder(order)}
        </Text>
      </View>

      <Text style={styles.itemTitle}>{getCODPerOrder(order)}</Text>
    </View>
  );

  //-------------- Order  view ---------------

  return (
    <View style={styles.darkBackground}>
      <View style={styles.modelView}>
        <View style={styles.rowContainer}>
          <Text style={styles.modelTitle}>{translationString.sign_detail}</Text>
          <TouchableOpacity
            style={styles.closeButtonContainer}
            onPress={closeOnPressed}>
            <Image source={CloseButton} />
          </TouchableOpacity>
        </View>
        <SectionList
          stickySectionHeadersEnabled={false}
          sections={dataSectionList}
          keyExtractor={(item, index) => index}
          renderItem={renderItem}
          renderSectionHeader={({section: {title}}) => {
            if (title == translationString.product) {
              return (
                <View style={styles.rowContainer}>
                  <Text style={styles.titleStyle}>{title}</Text>
                  <Text style={styles.qtyText}>{translationString.qty}</Text>
                </View>
              );
            } else {
              return <Text style={styles.titleStyle}>{title}</Text>;
            }
          }}
        />
        <View style={styles.divider} />
        <View style={styles.rowContainer}>
          <Text style={styles.signQtyTitle}>{translationString.sign_qty}</Text>

          <Text style={styles.signQtyValue}>{totalQuantity}</Text>
        </View>
        {job.codAmount > 0 && (
          <View style={styles.rowContainer}>
            <Text style={styles.totalCODTitle}>{getTotalCODValue()}</Text>
            <Text style={styles.totalCODValue}>{totalActualCodAmt}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkBackground: {
    width: Constants.screenWidth,
    height: Constants.screenHeight,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  modelView: {
    marginTop: -35,
    width: Constants.screenWidth - 20,
    minHeight: Constants.screenHeight / 3,
    maxHeight: Constants.screenHeight * 0.6,
    backgroundColor: Constants.WHITE,
    alignSelf: 'center',
    borderRadius: 8,
  },
  modelTitle: {
    flexDirection: 'row',
    color: Constants.Dark_Grey,
    paddingEnd: 16,
    paddingStart: 16,
    paddingTop: 16,
    fontSize: 16,
  },
  closeButtonContainer: {
    flex: 1,
    paddingEnd: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  flatlist: {
    padding: 16,
  },
  divider: {
    marginLeft: 16,
    marginRight: 16,
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  itemTitle: {
    fontSize: 18,
    paddingEnd: 16,
    paddingStart: 16,
    paddingTop: 8,
    paddingBottom: 4,
    color: Constants.Order_Item_Color,
    flex: 3,
  },
  itemQtyValue: {
    fontSize: 18,
    flex: 1,
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 8,
    alignSelf: 'flex-end',
    color: Constants.Order_Item_Color,
    textAlign: 'right',
    paddingBottom: 4,
  },
  titleStyle: {
    fontSize: 14,
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: Constants.Dark_Grey,
    flex: 3,
  },
  qtyText: {
    fontSize: 14,
    flex: 1,
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 10,
    paddingBottom: 10,
    alignSelf: 'flex-end',
    color: Constants.Dark_Grey,
    textAlign: 'right',
    paddingBottom: 4,
  },
  signQtyTitle: {
    fontSize: 16,
    paddingStart: 16,
    paddingTop: 8,
    color: Constants.Dark_Grey,
    paddingBottom: 8,
    flex: 3,
  },
  signQtyValue: {
    fontSize: 16,
    flex: 1,
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 8,
    color: Constants.Dark_Grey,
    alignSelf: 'flex-end',
    textAlign: 'right',
    paddingBottom: 8,
  },
  totalCODTitle: {
    fontSize: 16,
    paddingStart: 16,
    paddingTop: 8,
    color: Constants.Dark_Grey,
    paddingBottom: 8,
    flex: 3,
  },
  totalCODValue: {
    fontSize: 16,
    flex: 1,
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 8,
    paddingBottom: 16,
    color: Constants.THEME_COLOR,
    alignSelf: 'flex-end',
    textAlign: 'right',
    paddingBottom: 8,
  },
});

export default OrderItemsModel;
