import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const JobSortSchema = {
  name: Constants.JOB_SORT_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    type: {
      type: 'string?',
      default: '',
    },
    order: {
      type: 'string?',
      default: '',
    },
    isVIP: {
      type: 'bool',
      default: false,
    },
  },
};
