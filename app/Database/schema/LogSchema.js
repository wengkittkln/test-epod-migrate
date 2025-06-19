import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';
import moment from 'moment';

export const LogSchema = {
  name: Constants.LOG_SCHEMA,
  properties: {
    Message: {
      type: 'string',
      default: '',
    },
    CreatedDate: {
      type: 'string?',
      default: moment().format(),
    },
  },
};
