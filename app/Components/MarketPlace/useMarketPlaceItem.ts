import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import {Job} from '../../Model/Job';

export const useMarketPlaceItem = (data: Job) => {
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

  const getConsigneeTitleWithColon = () => {
    let title = '';

    if (data.jobType === Constants.JobType.DELIVERY) {
      title = translationString.receiver;
    }

    if (data.jobType === Constants.JobType.PICK_UP) {
      title = translationString.picker;
    }

    return title;
  };

  const getConsignee = () => {
    let nameValue = translationString.unknown;

    if (data.consignee) {
      nameValue = data.consignee;
    }

    if (data.customer && data.customer.customerCode) {
      nameValue = nameValue + `(${data.customer.customerCode})`;
    }

    return nameValue;
  };

  const getTrackingNumberOrCount = () => {
    let trackingNum = '';
    let isUnderline = false;
    if (!data.trackingList || data.trackingList === '') {
      if (data.orders && data.orders.length > 0) {
        if (data.orders.length === 1) {
          if (data.orders[0].trackingNo) {
            trackingNum = data.orders[0].trackingNo;
          } else {
            trackingNum = '-';
          }
        } else {
          isUnderline = true;
          trackingNum =
            translationString.formatString(
              translationString.do_num,
              data.orders.length,
            ) + '';
        }
      } else {
        trackingNum = '-';
      }
    } else {
      let list = data.trackingList.split(',');

      if (list.length === 1) {
        trackingNum = list[0];
      } else {
        isUnderline = true;
        trackingNum =
          translationString.formatString(
            translationString.do_num,
            list.length,
          ) + '';
      }
    }

    return {
      isUnderline: isUnderline,
      trackingNum: trackingNum,
    };
  };

  return {
    getConsigneeTitleWithColon,
    statusBarColour,
    getConsignee,
    getTrackingNumberOrCount,
  };
};
