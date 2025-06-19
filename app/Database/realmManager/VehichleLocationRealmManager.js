import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';
import {VehicleLocationSchema} from '../schema/VehichleLocationSchema';

const databaseOptions = {
  path: 'ePOD.realm',
  schema: [VehicleLocationSchema],
  schemaVersion: Constants.SCHEMA_VERSION,
  readOnly: false,
};

export const getNewVehicleLocationRealm = () => {
  return new Realm(databaseOptions);
};

export const insertNewLocation = (locationtModel, realm) => {
  realm.write(() => {
    realm.create(Constants.VEHICLE_LOCATION_SCHEMA, locationtModel);
  });
};

export const updateVehicleData = (locationtModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.VEHICLE_LOCATION_SCHEMA,
      locationtModel.id,
    );

    updateModel.syncStatus = locationtModel.syncStatus;
  });
};

export const queryAllVehicleData = (realm) => {
  let allResult = realm.objects(Constants.VEHICLE_LOCATION_SCHEMA);
  return allResult;
};

export const queryLocalVehicleData = (realm) => {
  let rule = `syncStatus=${Constants.SyncStatus.SYNC_PENDING}`;
  let existingData = realm
    .objects(Constants.VEHICLE_LOCATION_SCHEMA)
    .filtered(rule);
  return existingData;
};

export const queryVehicleDataWithinInterval = (realm, nextInterval) => {
  let rule = `operateTimeInt > ${nextInterval}`;
  let existingData = realm
    .objects(Constants.VEHICLE_LOCATION_SCHEMA)
    .filtered(rule)
    .sorted('operateTimeInt', true);

  return existingData;
};

export const deleteAllVehicleData = (realm) => {
  realm.write(() => {
    let locationList = realm.objects(Constants.VEHICLE_LOCATION_SCHEMA);
    realm.delete(locationList);
  });
};
