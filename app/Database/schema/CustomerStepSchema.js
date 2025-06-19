import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const CustomerStepSchema = {
  name: Constants.CUSTOMER_STEP_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    customerId: {
      type: 'int',
      default: 0,
    },
    sequence: {
      type: 'int',
      default: 0,
    },
    actionStatus: {
      type: 'int',
      default: 0,
    },
    stepCode: 'string?',
    jobType: 'int?',
    stepNeedPhoto: {
      type: 'bool',
      default: false,
    },
    stepNeedScanSku: {
      type: 'bool',
      default: false,
    },
    stepNeedVerifyItem: {
      type: 'bool',
      default: false,
    },
    stepNeedSummary: {
      type: 'bool',
      default: false,
    },
    stepRemark: 'string?',
    stepNeedReason: {
      type: 'bool',
      default: false,
    },
  },
};
