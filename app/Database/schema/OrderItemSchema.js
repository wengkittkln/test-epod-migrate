import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const OrderItemSchema = {
  name: Constants.ORDER_ITEM_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    cbm: {
      type: 'double',
      default: 0.0,
    },
    cbmUnit: {
      type: 'string?',
      default: '',
    },
    description: {
      type: 'string?',
      default: 0,
    },
    lineItem: {
      type: 'int',
      default: 0,
    },
    orderId: {
      type: 'int',
      default: 0,
    },
    quantity: {
      type: 'int?',
      default: 0,
    },
    remark: {
      type: 'string?',
      default: '',
    },
    sku: {
      type: 'string?',
      default: '',
    },
    uom: {
      type: 'string?',
      default: '',
    },
    weight: {
      type: 'double?',
      default: 0.0,
    },
    weightUnit: {
      type: 'string?',
      default: '',
    },
    isAddedFromLocal: {
      type: 'bool',
      default: false,
    },
    expectedQuantity: {
      type: 'int',
      default: 0,
    },
    isDeleted: {
      type: 'bool',
      default: false,
    },
    skuCode: {
      type: 'string?',
      default: '',
    },
    jobId: {
      type: 'int',
      default: 0,
    },
    isContainer: {
      type: 'bool',
      default: false,
    },
    isExpensive: {
      type: 'bool',
      default: false,
    },
    verifyQuantity: {
      type: 'int',
      default: 0,
    },
  },
};
