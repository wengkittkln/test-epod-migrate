import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const JobSchema = {
  name: Constants.JOB_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    manifestId: {
      type: 'int?',
      default: 0,
    },
    destination: {
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
    tags: {
      type: 'string?',
      default: '',
    },
    totalQuantity: {
      type: 'int',
      default: 0,
    },
    totalCbm: {
      type: 'float',
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
    status: {
      type: 'int',
      default: 0,
    },
    podTime: {
      type: 'string?',
      default: '',
    },
    podLocation: {
      type: 'string?',
      default: '',
    },
    fromSystem: {
      type: 'string?',
      default: '',
    },
    createdDate: {
      type: 'string?',
      default: '',
    },
    createdBy: {
      type: 'string?',
      default: '',
    },
    lastUpdatedDate: {
      type: 'string?',
      default: '',
    },
    isDeleted: {
      type: 'bool',
      default: false,
    },
    customerId: {
      type: 'int',
      default: 0,
    },
    orderList: {
      type: 'string?',
      default: '',
    },
    trackingList: {
      type: 'string?',
      default: '',
    },
    currentStep: {
      type: 'int?',
      default: 0,
    },
    currentStepCode: {
      type: 'int?',
      default: 1,
    },
    pendingStatus: {
      type: 'int?',
      default: 0,
    },
    latestActionId: {
      type: 'string?',
      default: '',
    },
    reasonDescription: {
      type: 'string?',
      default: '',
    },
    isSynced: {
      type: 'bool?',
      default: true,
    },
    longitude: {
      type: 'double?',
      default: 0.0,
    },
    latitude: {
      type: 'double?',
      default: 0.0,
    },
    sequence: {
      type: 'int?',
      default: 0,
    },
    jobType: {
      type: 'int?',
      default: 0,
    },
    isRemoved: {
      type: 'bool?',
      default: true,
    },
    codValue: {
      type: 'double?',
      default: 0.0,
    },
    customer: {
      type: Constants.CUSTOMER_SCHEMA,
      optional: true,
    },
    codReasonCode: {
      type: 'int?',
      default: 0,
    },
    csPhoneNo: {
      type: 'string?',
      default: '',
    },
    jobPassword: {
      type: 'string?',
      default: '',
    },
    isLocked: {
      type: 'bool?',
      default: false,
    },
    isForcedSequencing: {
      type: 'bool',
      default: false,
    },
    latestETA: {
      type: 'string?',
      default: '',
    },
    duration: {
      type: 'int?',
      default: 0,
    },
    district: {
      type: 'string?',
      default: '',
    },
    shopId: {
      type: 'int?',
      default: 0,
    },
    shop: {
      type: Constants.SHOPS_SCHEMA,
      optional: true,
    },
    isAllowBatchAction: {
      type: 'bool',
      default: false,
    },
    batchActionGroupBy: {
      type: 'string',
      default: '',
    },
    language: {
      type: 'string',
      default: 'E',
    },
    udfsJson: {
      type: 'string?',
      default: '',
    },
    containExpensiveItem: {
      type: 'bool',
      default: false,
    },
  },
};
