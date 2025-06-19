import {Results} from 'realm';
import * as Constants from '../../CommonConfig/Constants';
import {JobTransfer} from '../../Model/DatabaseModel/JobTransfer';
import {SyncStatus} from './../../CommonConfig/Constants';

export const insertNewItem = (model: JobTransfer, realm: Realm) => {

  model.jobDetails = model.jobIds;
  model.toDriver = model.transferTo?.toString();

  realm.write(() => {
    realm.create(Constants.JOB_TRANSFER_SCHEMA, model);
  });
};

export const getAllJobTransfer = async (realm: Realm) => {
  let allResult: Results<JobTransfer> = realm.objects(
    Constants.JOB_TRANSFER_SCHEMA,
  );
  return allResult;
};

export const getPendingJobTransferById = (id: number, realm: Realm) => {
  let allResult = realm.objectForPrimaryKey<JobTransfer>(
    Constants.JOB_TRANSFER_SCHEMA,
    id,
  );

  return allResult;
};

export const getPendingJobTransfer = async (realm: Realm) => {
  let allResult: Results<JobTransfer> = realm.objects(
    Constants.JOB_TRANSFER_SCHEMA,
  );

  return allResult.filtered('SyncStatus = 0');
};

export const deleteAllJobTransfer = (realm: Realm) => {
  realm.write(() => {
    let jobsTransferList = realm.objects(Constants.JOB_TRANSFER_SCHEMA);
    realm.delete(jobsTransferList);
  });
};

export const updateJobTransferStatus = (
  realm: Realm,
  id: number,
  status: number,
): boolean => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey<JobTransfer>(
      Constants.JOB_TRANSFER_SCHEMA,
      id,
    );

    if (!object) return false;

    object.status = status;
  });

  return true;
};

export const updateJobTransfer = (
  realm: Realm,
  model: any,
): boolean => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey<JobTransfer>(
      Constants.JOB_TRANSFER_SCHEMA,
      model.id!,
    );

    if (!object) return false;

    object.lastUpdatedBy = model.lastUpdatedBy;
    object.lastUpdatedDate = model.lastUpdatedDate;
    object.status = model.status;
    object.rejectReason = model.rejectReason;
    object.receivedParcelQuantity = model.receivedParcelQuantity;
  });

  return true;
};

export const getPendingJobTransferByDriverTo = async (realm: Realm, id: number) => {
  let allResult: Results<JobTransfer> = realm.objects(
    Constants.JOB_TRANSFER_SCHEMA,
  );

  return allResult.filtered(`transferTo = ${id} AND status = 0`);
};