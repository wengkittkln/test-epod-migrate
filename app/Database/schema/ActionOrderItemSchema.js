import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const ActionOrderItemSchema = {
  name: Constants.ACTION_ORDER_ITEM_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    orderItemId: {
      type: 'int?',
      default: null,
    },
    desc: {
      type: 'string?',
      default: '',
    },
    qty: {
      type: 'int?',
      default: 0,
    },
    orderId: {
      type: 'int?',
      default: 0,
    },
    actionId: {
      type: 'int?',
      default: 0,
    },
    parentId: {
      type: 'string?',
      default: '',
    },
    expQty: {
      type: 'int',
      default: 0,
    },
    uom: {
      type: 'string?',
      default: '',
    },
    syncStatus: {
      type: 'int',
      default: 0, //PhotoEntry.SYNC_PENDING //Local
    },
    scanSkuTime: {
      type: 'string?',
      default: '',
    },
    isContainer: {
      type: 'bool',
      default: false,
    },
  },
};
