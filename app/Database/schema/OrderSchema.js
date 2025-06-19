import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const OrderSchema = {
  name: Constants.ORDER_SCHEMA,
  primaryKey: 'key',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    key: {
      type: 'string',
      default: '',
    },
    orderNumber: {
      type: 'string?',
      default: '',
    },
    consignee: {
      type: 'string?',
      default: '',
    },
    decryptedConsignee: {
      type: 'string?',
      default: '',
    },
    contact: {
      type: 'string?',
      default: '',
    },
    decryptedContact: {
      type: 'string?',
      default: '',
    },
    sender: {
      type: 'string?',
      default: '',
    },
    senderContact: {
      type: 'string?',
      default: '',
    },
    destination: {
      type: 'string?',
      default: '',
    },
    requestArrivalTimeFrom: {
      type: 'string?',
      default: '',
    },
    requestArrivalTimeTo: {
      type: 'string?',
      default: '',
    },
    remark: {
      type: 'string?',
      default: '',
    },
    jobId: {
      type: 'int?',
      default: 0,
    },
    trackingNo: {
      type: 'string?',
      default: '',
    },
    isDeleted: {
      type: 'bool',
      default: false,
    },
    qrFormat: {
      type: 'string?',
      default: '',
    },
    codValue: {
      type: 'double?',
      default: 0.0,
    },
    codCurrency: {
      type: 'string?',
      default: '',
    },
    codAmount: {
      type: 'double',
      default: 0.0,
    },
  },
};
