import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const CustomerConfigurationSchema = {
  name: Constants.CUSTOMER_CONFIGURATION_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    customerId: 'int',
    tagName: {
      type: 'string?',
      default: '',
    },
    tagColour: {
      type: 'string?',
      default: '',
    },
    textColor: {
      type: 'string?',
      default: '',
    },
    overdueColor: {
      type: 'string?',
      default: '',
    },
  },
};
