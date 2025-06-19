import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const UsersSchema = {
  name: Constants.USERS_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int?',
      default: null,
    },
    name: {
      type: 'string?',
      default: null,
    },
    displayName: {
      type: 'string?',
      default: null,
    },
    isActive: {
      type: 'bool?',
      default: null,
    },
    lastUpdatedDate: {
      type: 'string?',
      default: '',
    },
  },
};
