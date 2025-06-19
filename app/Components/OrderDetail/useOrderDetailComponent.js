/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {Text, StyleSheet} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import moment from 'moment';
import * as OrderItemRealmManager from '../../Database/realmManager/OrderItemRealmManager';
import * as JobRealmManager from '../../Database/realmManager/JobRealmManager';
import {IndexContext} from '../../Context/IndexContext';
import {useDispatch} from 'react-redux';

export const useOrderDetailComponent = (orderModel, job) => {
  const [orderItemList, setOrderItemList] = useState([]);
  const [containerList, setContainerList] = useState([]);
  const {epodRealm} = React.useContext(IndexContext);
  const [isShowDecryptOrder, setIsShowDecryptOrder] = useState(false);
  const [decryptedConsignee, setDecryptedConsignee] = useState('');
  const [decryptedContact, setDecryptedContact] = useState('');

  const getTotalQuantity = (orderItem) => {
    let totalQuantityLabel = translationString.exact_amount_title;

    if (
      job.status !== Constants.JobStatus.PARTIAL_DELIVERY &&
      job.jobType === Constants.JobType.DELIVERY
    ) {
      totalQuantityLabel = `${totalQuantityLabel}: ${orderItem.expectedQuantity}`;

      return <Text style={styles.actualQuantity}>{totalQuantityLabel}</Text>;
    } else {
      if (orderItem.expectedQuantity > 0) {
        totalQuantityLabel = `${totalQuantityLabel} / ${translationString.expected_amount_title} : `;
      } else {
        totalQuantityLabel = totalQuantityLabel + ' : ';
      }

      totalQuantityLabel = `${totalQuantityLabel}`;
      let endingLabel = '';

      if (orderItem.expectedQuantity > 0) {
        endingLabel = `/${orderItem.expectedQuantity}`;
      }

      if (
        totalQuantityLabel.length > 0 &&
        orderItem.uom &&
        orderItem.uom !== ''
      ) {
        endingLabel = endingLabel + ' ' + orderItem.uom;
      }

      if (
        orderItem.quantity !== orderItem.expectedQuantity &&
        orderItem.expectedQuantity > 0
      ) {
        return (
          <Text style={styles.actualQuantity}>
            {totalQuantityLabel}{' '}
            <Text style={styles.redQuantity}>{orderItem.quantity}</Text>{' '}
            {endingLabel}
          </Text>
        );
      } else {
        return (
          <Text style={styles.actualQuantity}>
            {totalQuantityLabel}
            {orderItem.quantity} {endingLabel}
          </Text>
        );
      }
    }
  };

  useEffect(() => {
    if (orderModel.id) {
      let seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
        orderModel.id,
        epodRealm,
      );

      let selectedContainer = JobRealmManager.getJobContainersByJobId(
        job.id,
        epodRealm,
      );

      seletedOrderItems = seletedOrderItems.filter(
        (x) => x.sku && x.expectedQuantity > 0,
      );

      if (selectedContainer && selectedContainer.length > 0) {
        // seletedOrderItems.push(...selectedContainer);
      }

      if (seletedOrderItems.length > 0) {
        setOrderItemList(seletedOrderItems);
      }

      if (selectedContainer.length > 0) {
        setContainerList(selectedContainer);
      }
    }
  }, [orderModel]);

  const getDecryptData = () => {
    setDecryptedConsignee(
      !isShowDecryptOrder && orderModel.decryptedConsignee?.length > 0
        ? orderModel.decryptedConsignee
        : orderModel.consignee,
    );
    setDecryptedContact(
      !isShowDecryptOrder && orderModel.decryptedContact?.length > 0
        ? orderModel.decryptedContact
        : orderModel.contact,
    );

    setIsShowDecryptOrder(true);
  };

  return {
    orderItemList,
    containerList,
    getTotalQuantity,
    isShowDecryptOrder,
    decryptedConsignee,
    decryptedContact,
    getDecryptData,
    setIsShowDecryptOrder,
  };
};

export const useContainerDetailComponent = (job) => {
  const getTotalQuantity = (orderItem) => {
    let totalQuantityLabel = translationString.exact_amount_title;

    if (
      job.status !== Constants.JobStatus.PARTIAL_DELIVERY &&
      job.jobType === Constants.JobType.DELIVERY
    ) {
      totalQuantityLabel = `${totalQuantityLabel}: ${orderItem.expectedQuantity}`;

      return <Text style={styles.actualQuantity}>{totalQuantityLabel}</Text>;
    } else {
      if (orderItem.expectedQuantity > 0) {
        totalQuantityLabel = `${totalQuantityLabel} / ${translationString.expected_amount_title} : `;
      } else {
        totalQuantityLabel = totalQuantityLabel + ' : ';
      }

      totalQuantityLabel = `${totalQuantityLabel}`;
      let endingLabel = '';

      if (orderItem.expectedQuantity > 0) {
        endingLabel = `/${orderItem.expectedQuantity}`;
      }

      if (
        totalQuantityLabel.length > 0 &&
        orderItem.uom &&
        orderItem.uom !== ''
      ) {
        endingLabel = endingLabel + ' ' + orderItem.uom;
      }

      if (
        orderItem.quantity !== orderItem.expectedQuantity &&
        orderItem.expectedQuantity > 0
      ) {
        return (
          <Text style={styles.actualQuantity}>
            {totalQuantityLabel}{' '}
            <Text style={styles.redQuantity}>{orderItem.quantity}</Text>{' '}
            {endingLabel}
          </Text>
        );
      } else {
        return (
          <Text style={styles.actualQuantity}>
            {totalQuantityLabel}
            {orderItem.quantity} {endingLabel}
          </Text>
        );
      }
    }
  };

  return {
    getTotalQuantity,
  };
};

const styles = StyleSheet.create({
  actualQuantity: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginVertical: 16,
    color: 'black',
    flex: 1,
  },
  redQuantity: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginVertical: 16,
    color: 'red',
    flex: 1,
  },
});
