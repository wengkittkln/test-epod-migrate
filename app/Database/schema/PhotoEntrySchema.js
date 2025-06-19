import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import moment from 'moment';

export const PhotoEntrySchema = {
  name: Constants.PHOTO_ENTRY_SCHEMA,
  primaryKey: 'uuid',
  properties: {
    jobId: {
      type: 'int',
      default: 0,
    },
    actionId: {
      type: 'string',
      default: '',
    },
    file: {
      type: 'string',
      default: '', //file path
    },
    uuid: {
      type: 'string',
      default: uuidv4(), //UUID.randomUUID().toString(),
    },
    syncStatus: {
      type: 'int',
      default: Constants.SyncStatus.PENDING_SELECT_PHOTO,
    },
    createDate: {
      type: 'string?',
      default: moment().format(),
    },
    source: {
      type: 'int',
      default: 0,
    },
  },
};
