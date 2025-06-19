import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import moment from 'moment';

export const ActionSchema = {
  name: Constants.ACTION_SCHEMA,
  primaryKey: 'guid',
  properties: {
    guid: {
      type: 'string',
      default: uuidv4(), //UUID.randomUUID().toString(), //actionId
    },
    id: {
      type: 'int?',
      default: 0, //Id from server for upload photo
    },
    jobId: {
      type: 'int?',
      default: 0,
    },
    orderId: {
      type: 'int?',
      default: 0,
    },
    actionType: {
      type: 'int?',
      default: 0,
    },
    remark: {
      type: 'string?',
      default: '',
    },
    longitude: {
      type: 'double?',
      default: 0.0,
    },
    latitude: {
      type: 'double?',
      default: 0.0,
    },
    reasonDescription: {
      type: 'string?',
      default: '',
    },
    operateTime: {
      type: 'string?',
      default: moment().format(),
    },
    additionalParamsJson: {
      type: 'string?',
      default: '',
    },
    syncStatus: {
      type: 'int',
      default: 0, //PhotoEntry.SYNC_PENDING // Local
    },
    syncPhoto: {
      type: 'int',
      default: 0, //PhotoEntry.SYNC_PENDING
    },
    syncItem: {
      type: 'int',
      default: 0, //PhotoEntry.SYNC_PENDING
    },
    actionAttachment: {
      type: 'list',
      objectType: Constants.ATTACHMENT_SCHEMA,
    },
    actionOrderItem: {
      type: 'list',
      objectType: Constants.ACTION_ORDER_ITEM_SCHEMA,
    },
    needScanSku: {
      type: 'bool',
      default: true,
    },
    executeTime: {
      type: 'int',
      default: moment().valueOf(), //
    },
    actionJobBins: {
      type: 'list',
      objectType: Constants.JOB_BIN_SCHEMA,
    },
  },
};
