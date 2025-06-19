import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const DeltaSchema = {
  name: Constants.DELTA_SCHEMA,
  properties: {
    batch: {
      type: 'int',
      default: 0,
    },
    createdBy: {
      type: 'string',
      default: '',
    },
    createdDate: {
      type: 'string',
      default: '',
    },
    deliveryDate: {
      type: 'string',
      default: '',
    },
    groupId: {
      type: 'int',
      default: 0,
    },
    groupIds: {
      type: 'string',
      default: '',
    },
    id: {
      type: 'int',
      default: 0,
    },
    isDeleted: {
      type: 'bool',
      default: false,
    },
    jobs: {
      type: 'list',
      objectType: Constants.JOB_SCHEMA,
    },
    //   orders: {
    //     type: 'list',
    //     objectType: Constants.JOB_SCHEMA,
    //   },
    //   orderItems: {
    //     type: 'list',
    //     objectType: Constants.JOB_SCHEMA,
    //   },
    lastUpdatedDate: {
      type: 'string',
      default: '',
    },
    status: {
      type: 'int',
      default: 0,
    },
    userId: {
      type: 'int',
      default: 0,
    },
  },
};
