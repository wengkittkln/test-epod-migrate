import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const UserSchema = {
  name: Constants.USER_SCHEMA,
  properties: {
    auth_token: {
      type: 'string?',
      default: null,
    },
    expires_in: {
      type: 'int?',
      default: null,
    },
    id: {
      type: 'int?',
      default: null,
    },
    refresh_token: {
      type: 'string?',
      default: null,
    },
    name: {
      type: 'string?',
      default: null,
    },
    phoneNumber: {
      type: 'string?',
      default: null,
    },
    truckNo: {
      type: 'string?',
      default: null,
    },
    timezone: {
      type: 'string?',
      default: null,
    },
    companyName: {
      type: 'string?',
      default: null,
    },
  },
};
