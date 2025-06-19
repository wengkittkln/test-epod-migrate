import React, {useState, useEffect} from 'react';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import * as RootNavigation from '../../rootNavigation';
import {useSelector, useDispatch} from 'react-redux';
import 'react-native-get-random-values';
import * as JobHelper from '../../Helper/JobHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

export const useReorderJobItem = (item, navigation, isPreSequence) => {
  const getConsignee = () => {
    let nameValue = translationString.unknown;

    if (item.consignee) {
      nameValue = item.consignee;
    }

    if (item.customer && item.customer.customerCode) {
      nameValue = nameValue + `(${item.customer.customerCode})`;
    }

    return nameValue;
  };

  const getConsigneeTitleWithColon = () => {
    let title = '';

    if (item.jobType === Constants.JobType.DELIVERY) {
      title = translationString.receiver;
    }

    if (item.jobType === Constants.JobType.PICK_UP) {
      title = translationString.picker;
    }

    return title;
  };

  const getTrackingNumberOrCount = () => {
    let trackingNum = '';
    let isUnderline = false;
    if (!item.trackingList || item.trackingList === '') {
      trackingNum = '-';
    } else {
      let list = item.trackingList.split(',');

      if (list.length === 1) {
        trackingNum = list[0];
      } else {
        isUnderline = true;
        trackingNum = translationString.formatString(
          translationString.do_num,
          list.length,
        );
      }
    }

    return {
      isUnderline: isUnderline,
      trackingNum: trackingNum,
    };
  };

  const statusBarColour = (jobStatus) => {
    switch (jobStatus) {
      case Constants.JobStatus.OPEN:
        return Constants.Pending_Color;
      case Constants.JobStatus.IN_PROGRESS:
        return Constants.Shipping_Color;
      case Constants.JobStatus.COMPLETED:
        return Constants.Completed_Color;
      case Constants.JobStatus.FAILED:
        return Constants.Failed_Color;
      case Constants.JobStatus.PARTIAL_DELIVERY:
        return Constants.Partial_Delivery_Color;
      default:
        return 'transparent';
    }
  };

  const getBackgroundColor = (requestArrivalTimeTo, latestETA) => {
    if (latestETA && requestArrivalTimeTo) {
      moment(latestETA).isAfter(requestArrivalTimeTo)
        ? Constants.Alert_Color
        : '';
    }
  };

  const navigateToRouteSequence = (job) => {
    if (job.latitude && job.longitude) {
      const jobId = job.id;
      navigation.navigate('RouteSequence', {jobId});
    }
  };

  return {
    statusBarColour,
    getConsignee,
    getConsigneeTitleWithColon,
    getTrackingNumberOrCount,
    getBackgroundColor,
    navigateToRouteSequence,
  };
};
