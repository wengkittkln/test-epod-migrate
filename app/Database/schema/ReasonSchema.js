import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const ReasonSchema = {
  name: Constants.REASON_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    customerId: 'int?',
    reasonAction: {
      type: 'int',
      default: 0,
    },
    reasonType: {
      type: 'int',
      default: 0,
    },
    description: {
      type: 'string',
      default: '',
    },
  },
};
