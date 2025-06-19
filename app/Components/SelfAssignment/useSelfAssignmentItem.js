/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {Text, StyleSheet} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';

export const useSelfAssignmentItem = (job) => {
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
