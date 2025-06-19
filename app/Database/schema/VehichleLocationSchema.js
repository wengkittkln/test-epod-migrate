import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const VehicleLocationSchema = {
  name: Constants.VEHICLE_LOCATION_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    accuracy: {
      type: 'float?',
      default: 0.0,
    },
    speed: {
      type: 'float?',
      default: 0.0,
    },
    bearing: {
      type: 'float?',
      default: 0.0,
    },
    latitude: {
      type: 'double',
      default: 0.0,
    },
    longitude: {
      type: 'double',
      default: 0.0,
    },
    altitude: {
      type: 'double?',
      default: 0.0,
    },
    guid: {
      type: 'string',
      default: '', //UUID.randomUUID().toString(),
    },
    operateTime: {
      type: 'string',
      default: '',
    },
    syncStatus: {
      type: 'int',
      default: 0, //PhotoEntry.SYNC_PENDING //Local
    },
    manifestId: {
      type: 'int?',
      default: 0,
    },
    operateTimeInt: {
      type: 'int',
      default: 0,
    },
    batteryLevel: {
      type: 'double?',
      default: 0.0,
    },
  },
};
