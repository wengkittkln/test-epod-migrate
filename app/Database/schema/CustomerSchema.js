import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const CustomerSchema = {
  name: Constants.CUSTOMER_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    customerCode: {
      type: 'string',
      default: '',
    },
    regexPatternValue: {
      type: 'string?',
      default: '',
    },
    description: {
      type: 'string?',
      default: '',
    },
    tnC: {
      type: 'string?',
      default: '',
    },
    customerSteps: {
      type: 'list',
      objectType: Constants.CUSTOMER_STEP_SCHEMA,
    },
    reasons: {
      type: 'list',
      objectType: Constants.REASON_SCHEMA,
    },
    skuRegexPatternValue: {
      type: 'string?',
      default: '',
    },
    customerConfigurations: {
      type: 'list',
      objectType: Constants.CUSTOMER_CONFIGURATION_SCHEMA,
    },
    isAllowOverCollect: {
      type: 'bool',
      default: false,
    },
    binWeight: {
      type: 'int',
      default: '10',
    },
  },
};
