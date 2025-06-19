import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const UserJwtSchema = {
  name: Constants.USER_JWT_SCHEMA,
  properties: {
    aud: {
      type: 'string',
      default: '',
    },
    exp: {
      type: 'int',
      default: 0,
    },
    iat: {
      type: 'int',
      default: 0,
    },
    id: {
      type: 'string',
      default: '',
    },
    iss: {
      type: 'string',
      default: '',
    },
    jti: {
      type: 'string',
      default: '',
    },
    nbf: {
      type: 'int',
      default: 0,
    },
    rol: {
      type: 'string',
      default: '',
    },
    sub: {
      type: 'string',
      default: '',
    },
    usertypec: {
      type: 'string',
      default: '',
    },
    companyid: {
      type: 'string',
      default: '',
    },
  },
};
