import Realm from 'realm';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import {v4 as uuidv4} from 'uuid';
import moment from 'moment';
import {SyncStatus} from './../../CommonConfig/Constants';

export const JobTransferSchema = {
  name: Constants.JOB_TRANSFER_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    jobDetails: {
      type: 'string',
      default: '',
    },
    transferReason: {
      type: 'string?',
      default: '',
    },
    transferTo: {
      type: 'int',
      default: 0,
    },
    transferedParcelQuantity: {
      type: 'int',
      default: 0,
    },
    receivedParcelQuantity: {
      type: 'int',
      default: 0,
    },
    /// <summary>
    /// PENDING,
    /// CANCELLED,
    /// REJECTED,
    /// COMPLETED,
    /// </summary>
    status: {
      type: 'int',
      default: 0,
    },
    rejectReason: {
      type: 'string?',
      default: '',
    },
    createdBy: {
      type: 'int?',
      default: '',
    },
    createdByName: {
      type: 'string?',
      default: '',
    },
    createdDate: {
      type: 'string?',
      default: '',
    },
    lastUpdatedDate: {
      type: 'string?',
      default: '',
    },
    lastUpdatedBy: {
      type: 'int?',
      default: 0,
    },
    lastUpdatedByName: {
      type: 'string?',
      default: '',
    },
    //Not is use
    longitude: {
      type: 'double?',
      default: 0.0,
    },
    latitude: {
      type: 'double?',
      default: 0.0,
    },
    toDriver: {
      type: 'string?',
      default: '',
    },
  },
};

/*
Status:
0: Processing
1: Rejected
2: Cancelled
3: Accepted
*/
