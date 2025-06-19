import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const CallLogSchema = {
  name: Constants.CALL_LOG_SCHEMA,
  properties: {
    phoneNo: {
      type: 'string',
      default: '',
    },
    startCallDate: {
      type: 'string',
      default: '',
    },
    endCallDate: {
      type: 'string',
      default: '',
    },
    duration: {
      type: 'string',
      default: '',
    },
  },
};
