import {Results} from 'realm';
import * as Constants from '../../CommonConfig/Constants';
import {JobBin} from '../../Model/DatabaseModel/JobBin';
import {SyncStatus} from './../../CommonConfig/Constants';

export const insertSampleItem = (realm: Realm) => {
  const model: JobBin = {
    jobId: 1,
    bin: '12345',
    weight: 15,
    netWeight: 5,
    withBin: true,
    isReject: 1,
    isSynced: false,
  };

  realm.write(() => {
    realm.create(Constants.JOB_BIN_SCHEMA, model);
  });
};

export const insertNewItem = (model: JobBin, realm: Realm) => {
  realm.write(() => {
    realm.create(Constants.JOB_BIN_SCHEMA, model);
  });
};

export const getAllJobBin = async (realm: Realm) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);
  return allResult;
};

export const getJobBinByBin = (realm: Realm, bin: number, jobId: number) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);

  return allResult.filtered(`bin = "${bin}" AND jobId = ${jobId}`);
};

export const getJobBinByJob = (realm: Realm, jobId: number) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);

  return allResult.filtered(`jobId = ${jobId}`);
};

export const getJobBinBySku = (realm: Realm, bin: number) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);

  return allResult.filtered(`bin = "${bin}"`);
};

export const getPendingSyncJobBin = async (realm: Realm) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);

  return allResult.filtered('isSynced = false');
};

export const deleteAllJobBin = (realm: Realm) => {
  realm.write(() => {
    let jobBinList = realm.objects(Constants.JOB_BIN_SCHEMA);
    realm.delete(jobBinList);
  });
};

export const deleteJobBinById = (realm: Realm, id: number) => {
  realm.write(() => {
    let jobBinList = realm.objectForPrimaryKey<JobBin>(
      Constants.JOB_BIN_SCHEMA,
      id,
    );
    realm.delete(jobBinList);
  });
};

export const updateJobBinStatusById = (
  realm: Realm,
  id: number,
  status: number,
): boolean => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey<JobBin>(
      Constants.JOB_BIN_SCHEMA,
      id,
    );

    if (!object) return false;

    object.isSynced = false;
    object.isReject = status;
  });

  return true;
};

export const updateJobBin = (realm: Realm, model: any): boolean => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey<JobBin>(
      Constants.JOB_BIN_SCHEMA,
      model.id!,
    );

    if (!object) return false;

    object.weight = model.weight;
    object.netWeight = model.netWeight;
    object.isSynced = false;
    object.isReject = model.isReject;
    object.withBin = model.withBin;
  });

  return true;
};

export const getRejectedJobBinByJobId = async (realm: Realm, jobId: number) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);

  return allResult.filtered(`jobId = ${jobId} AND isReject = 1`);
};

export const isJobHaveBin = async (realm: Realm, jobId: number) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);

  return allResult.filtered(`jobId = ${jobId}`).length > 0;
};

export const isJobBinExist = async (
  realm: Realm,
  jobId: number,
  bin: string,
) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);
  return allResult.some((data) => data.jobId == jobId && data.bin == bin);
};

export const rejectJobBin = (
  realm: Realm,
  id: number,
  isReject: number,
  rejectReason: string,
): boolean => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey<JobBin>(
      Constants.JOB_BIN_SCHEMA,
      id,
    );

    if (!object) return false;

    object.isSynced = false;
    object.isReject = isReject;
    object.rejectedReason = rejectReason;
  });

  return true;
};

export const isBinDuplicateWithOtherJob = async (
  realm: Realm,
  jobId: number,
  sku: string,
) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);
  const sameSkuList = allResult.filtered(`bin = "${sku}"`);
  const isDuplicate = sameSkuList.some((data) => data.jobId != jobId);
  return isDuplicate;
};

export const updateJobBinSyncStatus = (realm: Realm, model: any) => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey<JobBin>(
      Constants.JOB_BIN_SCHEMA,
      model.id!,
    );

    if (!object) return;

    object.isSynced = !model.isSynced;
  });
};

export const updateCollectionJobBinToDeliveryJobBin = (
  realm: Realm,
  collectionJobId: number,
  deliveryJobId: number,
) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);
  const collectedJobBin = JSON.parse(
    JSON.stringify(allResult.filtered(`jobId = ${collectionJobId}`)),
  );
  collectedJobBin.forEach((bin, index) => {
    bin.id = allResult.length;
    bin.jobId = deliveryJobId;
    bin.isSynced = false;
    realm.write(() => {
      realm.create(Constants.JOB_BIN_SCHEMA, bin);
    });
  });
};

export const getJobBinQuantityByJob = (realm: Realm, jobId: number) => {
  let allResult: Results<JobBin> = realm.objects(Constants.JOB_BIN_SCHEMA);

  return allResult.filtered(`jobId = ${jobId}`).length;
};
