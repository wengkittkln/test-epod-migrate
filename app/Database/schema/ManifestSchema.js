import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const ManifestSchema = {
  name: Constants.MANIFEST_SCHEMA,
  primaryKey: 'manifestId',
  properties: {
    manifestId: 'int',
    id: {
      type: 'int',
      default: 0,
    },
    deliveryDate: {
      type: 'string?',
      default: '',
    },
    userId: {
      type: 'int',
      default: 0,
    },
    status: {
      type: 'int',
      default: 0,
    },
    groupId: {
      type: 'int',
      default: 0,
    },
    groupIds: {
      type: 'string',
      default: '',
    },
    batch: {
      type: 'int',
      default: 0,
    },
    createdDate: {
      type: 'string?',
      default: '',
    },
    createdBy: {
      type: 'string?',
      default: '',
    },
    isDeleted: {
      type: 'bool',
      default: false,
    },
    jobs: {
      type: 'list',
      objectType: Constants.JOB_SCHEMA,
    },
    orders: {
      type: 'list',
      objectType: Constants.ORDER_SCHEMA,
    },
    orderItems: {
      type: 'list',
      objectType: Constants.ORDER_ITEM_SCHEMA,
    },
    jobContainers: {
      type: 'list',
      objectType: Constants.JOB_CONTAINER_SCHEMA,
    },
    sequencedStatus: {
      type: 'int?',
    },
    sequencedCount: {
      type: 'int?',
    },
    sequenceLimit: {
      type: 'int?',
    },
    isForcedSequencing: {
      type: 'bool',
      default: false,
    },
  },
};
