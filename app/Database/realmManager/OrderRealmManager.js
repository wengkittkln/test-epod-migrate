import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const getOrderByJodId = (jobId, realm) => {
  let allResult = realm.objects(Constants.ORDER_SCHEMA);
  let filteredResult = allResult.filtered(`jobId = ${jobId} `);
  return filteredResult;
};

export const updateOrderData = (orderModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.ORDER_SCHEMA,
      orderModel.key,
    );

    if (
      orderModel.orderNumber !== null &&
      typeof orderModel.orderNumber !== 'undefined'
    ) {
      updateModel.orderNumber = orderModel.orderNumber;
    }

    if (
      orderModel.consignee !== null &&
      typeof orderModel.consignee !== 'undefined'
    ) {
      updateModel.consignee = orderModel.consignee;
    }

    if (
      orderModel.decryptedConsignee !== null &&
      typeof orderModel.decryptedConsignee !== 'undefined'
    ) {
      updateModel.decryptedConsignee = orderModel.decryptedConsignee;
    }

    if (
      orderModel.contact !== null &&
      typeof orderModel.contact !== 'undefined'
    ) {
      updateModel.contact = orderModel.contact;
    }

    if (
      orderModel.decryptedContact !== null &&
      typeof orderModel.decryptedContact !== 'undefined'
    ) {
      updateModel.decryptedContact = orderModel.decryptedContact;
    }

    if (
      orderModel.sender !== null &&
      typeof orderModel.sender !== 'undefined'
    ) {
      updateModel.sender = orderModel.sender;
    }

    if (
      orderModel.senderContact !== null &&
      typeof orderModel.senderContact !== 'undefined'
    ) {
      updateModel.senderContact = orderModel.senderContact;
    }

    if (
      orderModel.destination !== null &&
      typeof orderModel.destination !== 'undefined'
    ) {
      updateModel.destination = orderModel.destination;
    }

    if (
      orderModel.requestArrivalTimeFrom !== null &&
      typeof orderModel.requestArrivalTimeFrom !== 'undefined'
    ) {
      updateModel.requestArrivalTimeFrom = orderModel.requestArrivalTimeFrom;
    }

    if (
      orderModel.requestArrivalTimeTo !== null &&
      typeof orderModel.requestArrivalTimeTo !== 'undefined'
    ) {
      updateModel.requestArrivalTimeTo = orderModel.requestArrivalTimeTo;
    }

    if (
      orderModel.remark !== null &&
      typeof orderModel.remark !== 'undefined'
    ) {
      updateModel.remark = orderModel.remark;
    }

    if (orderModel.jobId !== null && typeof orderModel.jobId !== 'undefined') {
      updateModel.jobId = orderModel.jobId;
    }

    if (
      orderModel.trackingNo !== null &&
      typeof orderModel.trackingNo !== 'undefined'
    ) {
      updateModel.trackingNo = orderModel.trackingNo;
    }

    if (
      orderModel.isDeleted !== null &&
      typeof orderModel.isDeleted !== 'undefined'
    ) {
      updateModel.isDeleted = orderModel.isDeleted;
    }

    if (
      orderModel.qrFormat !== null &&
      typeof orderModel.qrFormat !== 'undefined'
    ) {
      updateModel.qrFormat = orderModel.qrFormat;
    }

    if (
      orderModel.codValue !== null &&
      typeof orderModel.codValue !== 'undefined'
    ) {
      updateModel.codValue = orderModel.codValue;
    }

    if (
      orderModel.codCurrency !== null &&
      typeof orderModel.codCurrency !== 'undefined'
    ) {
      updateModel.codCurrency = orderModel.codCurrency;
    }

    if (
      orderModel.codAmount !== null &&
      typeof orderModel.codAmount !== 'undefined'
    ) {
      updateModel.codAmount = orderModel.codAmount;
    }
  });
};

export const getOrderById = (orderModel, realm) => {
  return (
    realm
      .objects(Constants.ORDER_SCHEMA)
      .filtered('id == $0', orderModel.id)[0] || null
  );
};

export const getOrderByOrderNumber = (orderNumber, realm) => {
  return realm
    .objects(Constants.ORDER_SCHEMA)
    .filtered('orderNumber = $0', orderNumber);
};

export const updateActionOrderItemData = (orderModel, realm) => {};
