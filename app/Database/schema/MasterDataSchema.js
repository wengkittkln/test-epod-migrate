import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const MasterDataSchema = {
  name: Constants.MASTER_DATA_SCHEMA,
  primaryKey: 'id',
  properties: {
    customerCode: {
      type: 'string',
      default: '',
    },
    customerSteps: {
      type: 'list',
      objectType: Constants.CUSTOMER_STEP_SCHEMA,
    },
    description: {
      type: 'string',
      default: '',
    },
    id: {
      type: 'int',
      default: 0,
    },
    reasons: {
      type: 'list',
      objectType: Constants.REASON_SCHEMA,
    },
    regexPatternValue: 'string?',
    tnC: 'string?',
  },
};
