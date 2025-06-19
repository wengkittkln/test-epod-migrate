import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const ConfigurationSchema = {
  name: Constants.CONFIGURATION_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    group: {
      type: 'string?',
      default: null,
    },
    key: {
      type: 'string?',
      default: null,
    },
    value: {
      type: 'string?',
      default: null,
    },
  },
};
