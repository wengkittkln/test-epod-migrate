import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const ShopsSchema = {
  name: Constants.SHOPS_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int?',
      default: null,
    },
    qrContent: {
      type: 'string?',
      default: '',
    },
    lastUpdatedDate: {
      type: 'string?',
      default: '',
    },
    shopCode: {
      type: 'string?',
      default: '',
    },
  },
};
