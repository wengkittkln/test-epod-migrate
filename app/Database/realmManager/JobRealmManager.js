import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewJob = (jobModel, realm) => {
  realm.write(() => {
    realm.create(Constants.JOB_SCHEMA, jobModel);
  });
};

export const updateCustomerByJobId = (jobId, customerModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(Constants.JOB_SCHEMA, jobId);
    updateModel.customer = customerModel;
  });
};

export const updateJobData = (jobModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.JOB_SCHEMA,
      jobModel.id,
    );
    if (jobModel.manifestId) {
      updateModel.manifestId = jobModel.manifestId;
    }

    if (jobModel.destination && jobModel.destination.length > 0) {
      updateModel.destination = jobModel.destination;
    }

    if (jobModel.consignee && jobModel.consignee.length > 0) {
      updateModel.consignee = jobModel.consignee;
    }

    if (jobModel.decryptedConsignee && jobModel.decryptedConsignee.length > 0) {
      updateModel.decryptedConsignee = jobModel.decryptedConsignee;
    }

    if (jobModel.contact && jobModel.contact.length > 0) {
      updateModel.contact = jobModel.contact;
    }

    if (jobModel.decryptedContact && jobModel.decryptedContact.length > 0) {
      updateModel.decryptedContact = jobModel.decryptedContact;
    }

    if (
      jobModel.requestArrivalTimeFrom &&
      jobModel.requestArrivalTimeFrom.length > 0
    ) {
      updateModel.requestArrivalTimeFrom = jobModel.requestArrivalTimeFrom;
    }

    if (
      jobModel.requestArrivalTimeTo &&
      jobModel.requestArrivalTimeTo.length > 0
    ) {
      updateModel.requestArrivalTimeTo = jobModel.requestArrivalTimeTo;
    }

    if (jobModel.remark && jobModel.remark.length > 0) {
      updateModel.remark = jobModel.remark;
    }

    if (jobModel.totalQuantity) {
      updateModel.totalQuantity = jobModel.totalQuantity;
    }

    if (jobModel.totalCbm) {
      updateModel.totalCbm = jobModel.totalCbm;
    }

    if (jobModel.codCurrency && jobModel.codCurrency.length > 0) {
      updateModel.codCurrency = jobModel.codCurrency;
    }

    if (jobModel.codAmount) {
      updateModel.codAmount = jobModel.codAmount;
    }

    if (jobModel.status !== null) {
      updateModel.status = jobModel.status;
    }

    if (
      (jobModel.podTime && jobModel.podTime.length > 0) ||
      jobModel.podTime === null
    ) {
      updateModel.podTime = jobModel.podTime;
    }

    if (jobModel.podLocation && jobModel.podLocation.length > 0) {
      updateModel.podLocation = jobModel.podLocation;
    }

    if (jobModel.fromSystem && jobModel.fromSystem.length > 0) {
      updateModel.fromSystem = jobModel.fromSystem;
    }

    if (jobModel.createdDate && jobModel.createdDate.length > 0) {
      updateModel.createdDate = jobModel.createdDate;
    }

    if (jobModel.createdBy && jobModel.createdBy.length > 0) {
      updateModel.createdBy = jobModel.createdBy;
    }

    if (jobModel.lastUpdatedDate && jobModel.lastUpdatedDate.length > 0) {
      updateModel.lastUpdatedDate = jobModel.lastUpdatedDate;
    }

    if (jobModel.isDeleted !== null) {
      updateModel.isDeleted = jobModel.isDeleted;
    }

    if (jobModel.customerId) {
      updateModel.customerId = jobModel.customerId;
    }

    if (jobModel.orderList && jobModel.orderList.length > 0) {
      updateModel.orderList = jobModel.orderList;
    }

    if (jobModel.trackingList && jobModel.trackingList.length > 0) {
      updateModel.trackingList = jobModel.trackingList;
    }

    if (jobModel.currentStep !== null) {
      updateModel.currentStep = jobModel.currentStep;
    }

    if (jobModel.currentStepCode !== null) {
      updateModel.currentStepCode = jobModel.currentStepCode;
    }

    if (jobModel.pendingStatus !== null) {
      updateModel.pendingStatus = jobModel.pendingStatus;
    }

    if (
      (jobModel.latestActionId && jobModel.latestActionId.length > 0) ||
      jobModel.latestActionId === null
    ) {
      updateModel.latestActionId = jobModel.latestActionId;
    }

    if (jobModel.reasonDescription && jobModel.reasonDescription.length > 0) {
      updateModel.reasonDescription = jobModel.reasonDescription;
    }

    if (jobModel.isSynced !== null) {
      updateModel.isSynced = jobModel.isSynced;
    }

    if (jobModel.longitude) {
      updateModel.longitude = jobModel.longitude;
    }

    if (jobModel.latitude) {
      updateModel.latitude = jobModel.latitude;
    }

    if (jobModel.sequence !== null) {
      updateModel.sequence = jobModel.sequence;
    }

    if (jobModel.jobType) {
      updateModel.jobType = jobModel.jobType;
    }

    updateModel.isRemoved = jobModel.isRemoved;

    if (jobModel.codValue) {
      updateModel.codValue = jobModel.codValue;
    }

    if (jobModel.codReasonCode !== null) {
      updateModel.codReasonCode = jobModel.codReasonCode;
    }

    if (
      jobModel.csPhoneNo !== null ||
      (jobModel.csPhoneNo && jobModel.csPhoneNo.length > 0)
    ) {
      updateModel.csPhoneNo = jobModel.csPhoneNo;
    }

    if (jobModel.isLocked != null) {
      updateModel.isLocked = jobModel.isLocked;
    }

    if (jobModel.latestETA && jobModel.latestETA.length > 0) {
      updateModel.latestETA = jobModel.latestETA;
    }

    if (jobModel.isForcedSequencing) {
      updateModel.isForcedSequencing = jobModel.isForcedSequencing;
    }

    if (jobModel.duration) {
      updateModel.duration = jobModel.duration;
    }

    if (jobModel.tags) {
      updateModel.tags = jobModel.tags;
    }

    if (jobModel.language) {
      updateModel.language = jobModel.language;
    }

    updateModel.jobPassword = jobModel.jobPassword;
    updateModel.isAllowBatchAction = jobModel.isAllowBatchAction;
    updateModel.batchActionGroupBy = jobModel.batchActionGroupBy;
    updateModel.udfsJson = jobModel.udfsJson;
    updateModel.containExpensiveItem = jobModel.containExpensiveItem;
  });
};

export const queryAllJobsData = (realm) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  return allResult;
};

export const getAllJobListBySequence = (
  realm,
  jobStatus,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status <= ${jobStatus} AND isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} SORT(sequence ASC) `,
  );
  return filteredResult;
};

export const getAllJobByRequestArrivalTimeFromAsc = (
  realm,
  jobType = Constants.JobType.ALL,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} SORT(requestArrivalTimeFrom ASC) `,
  );
  return filteredResult;
};

export const searchJobByTrackingAndOrderNo = (
  realm,
  searchText,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);

  let filteredResult = allResult.filtered(
    `isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} AND (trackingList LIKE[c] '*${searchText}*' OR orderList LIKE[c] '*${searchText}*' OR destination LIKE[c] '*${searchText}*')`,
  );
  return filteredResult;
};

export const getJobByTrackingNo = (
  realm,
  searchText,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);

  let filteredResult = allResult.filter((j) => {
    return (
      j.isDeleted === isDeleted &&
      j.isRemoved === isRemoved &&
      searchText.split(',').some((searchItem) => {
        return j.trackingList
          .split(',')
          .map((b) => b.trim())
          .includes(searchItem.trim());
      })
    );
  });

  // let filteredResult = allResult.filtered(
  //   `isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} AND trackingList = '${searchText}'`,
  // );
  return filteredResult;
};

export const getAllJobSortByDescStatusAscSeqAscTime = (
  realm,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} SORT(status DESC, sequence ASC, requestArrivalTimeFrom ASC, requestArrivalTimeTo ASC) `,
  );
  return filteredResult;
};

export const getAllJobByJobTypeSortByDecStatusAscTime = (
  realm,
  jobType,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} AND jobType = ${jobType} SORT(status DESC,  requestArrivalTimeFrom ASC, requestArrivalTimeTo ASC) `,
  );
  return filteredResult;
};

export const getAllJobByStatusSortByDescStatusAscSeqAscTime = (
  realm,
  jobStatus,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status <= ${jobStatus} AND isDeleted = ${isDeleted} AND isRemoved = ${isRemoved}  SORT(status DESC,  sequence ASC, requestArrivalTimeFrom ASC, requestArrivalTimeTo ASC) `,
  );
  return filteredResult;
};

export const getAllJobByTransferStatusSortByDescStatusAscSeqAscTime = (
  realm,
  jobStatus,
  isDeleted = false,
  isRemoved = false,
  isLocked = true,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status <= ${jobStatus} 
    AND isDeleted = ${isDeleted} 
    AND isRemoved = ${isRemoved} 
    AND isLocked != ${isLocked}
    SORT(status DESC,  sequence ASC, requestArrivalTimeFrom ASC, requestArrivalTimeTo ASC) `,
  );
  return filteredResult;
};

export const getAllJobByStatusJobTypeSortByDescStatusAscSeqAscTime = (
  realm,
  jobStatus,
  filterType,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status <= ${jobStatus} AND isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} AND jobType = ${filterType}  SORT(sequence ASC, status DESC, requestArrivalTimeFrom ASC, requestArrivalTimeTo ASC) `,
  );
  return filteredResult;
};

export const getAllJobSortByPODTime = (
  realm,
  jobStatus,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status == ${jobStatus} AND isDeleted = ${isDeleted} AND isRemoved = ${isRemoved}  SORT(podTime DESC) `,
  );
  return filteredResult;
};

export const getAllJobSortByPODTimeAndStatus = (
  realm,
  jobStatus,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status >= ${jobStatus} AND isDeleted = ${isDeleted} AND isRemoved = ${isRemoved}  SORT(podTime DESC) `,
  );
  return filteredResult;
};

export const getAllJobSortByPODTimeAndJobType = (
  realm,
  jobStatus,
  filterType,
  isDeleted = false,
  isRemoved = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status == ${jobStatus} AND isDeleted = ${isDeleted} AND isRemoved = ${isRemoved} AND jobType = ${filterType} SORT(podTime DESC) `,
  );
  return filteredResult;
};

export const getSelectedJobDeleted = (realm, jobId, isRemoved = false) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `id == ${jobId} AND isRemoved = ${isRemoved} LIMIT(1)`,
  );
  return filteredResult;
};

export const getSelectedJob = (
  realm,
  jobId,
  isRemoved = false,
  isDelete = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `id == ${jobId} AND isRemoved = ${isRemoved} AND isDeleted = ${isDelete} LIMIT(1)`,
  );
  return filteredResult;
};

export const getJobByJobId = (jobId, realm) => {
  let selectedResult = realm.objectForPrimaryKey(Constants.JOB_SCHEMA, jobId);

  return selectedResult;
};

export const deleteAllJobsData = (realm) => {
  realm.write(() => {
    let jobsList = realm.objects(Constants.JOB_SCHEMA);
    realm.delete(jobsList);
  });
};

export const getPendingJobByDecStatusAcsArrivalTime = (
  realm,
  jobStatus,
  isRemoved = false,
  isDelete = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `status <= ${jobStatus} AND isDeleted = ${isDelete} AND isRemoved = ${isRemoved}  SORT(status DESC, requestArrivalTimeFrom ASC) `,
  );
  return filteredResult;
};

export const searchSingleJobByTrackingNo = (
  realm,
  search,
  isRemoved = false,
  isDelete = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `trackingList LIKE[c] "*${search}*" AND isDeleted = ${isDelete} AND isRemoved = ${isRemoved}`,
  );
  return filteredResult;
};

export const searchSingleJobByOrder = (
  realm,
  search,
  isRemoved = false,
  isDelete = false,
) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `orderList LIKE[c] "*${search}*" AND isDeleted = ${isDelete} AND isRemoved = ${isRemoved}`,
  );
  return filteredResult && filteredResult.length > 0 ? filteredResult[0] : null;
};

export const updateJobTransferStatus = (id, isLocked, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(Constants.JOB_SCHEMA, id);
    if (updateModel != null) {
      updateModel.isLocked = isLocked;
    }
  });
};
export const updateSequenceByJobId = (jobId, sequence, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(Constants.JOB_SCHEMA, jobId);
    updateModel.sequence = sequence;
  });
};

export const rollbackAllSequence = (realm) => {
  realm.write(() => {
    let updateModel = realm.objects(Constants.JOB_SCHEMA);
    for (let i = 0; i < updateModel.length; i++) {
      updateModel[i].sequence = null;
    }
  });
};

export const getIsForcedSequencing = (realm) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered('isForcedSequencing == true ');
  return (
    filteredResult != null &&
    filteredResult !== undefined &&
    filteredResult.length > 0
  );
};

export const getFirstJob = (realm) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    'status <= 1 AND isDeleted = false AND isRemoved = false SORT(status ASC, sequence ASC) ',
  );
  return filteredResult;
};

export const resetLatestETA = (realm) => {
  realm.write(() => {
    let updateModel = realm
      .objects(Constants.JOB_SCHEMA)
      .filtered('status = 0 OR status = 1');

    for (let i = 0; i < updateModel.length; i++) {
      updateModel[i].latestETA = null;
    }
  });
};

export const updateLatestETA = (realm, id, latestETA) => {
  realm.write(() => {
    let updateModel = realm
      .objects(Constants.JOB_SCHEMA)
      .filtered('id = ' + id);

    if (updateModel) {
      updateModel[0].latestETA = latestETA;
    }
  });
};

export const getJobContainersByJobId = (jobId, realm) => {
  let allResult = realm.objects(Constants.JOB_CONTAINER_SCHEMA);
  let filteredResult = allResult.filtered(`jobId = ${jobId} `);
  return filteredResult;
};

export const getJobWithSameContactNumber = (contact, realm) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  let filteredResult = allResult.filtered(
    `contact = "${contact}" 
    AND isRemoved = false 
    AND isDeleted = false  
    AND isLocked != true 
    AND isAllowBatchAction = true
    AND (status = 0 OR status = 1)`,
  );
  return filteredResult;
};

export const getJobWithCustomFilter = (filterList, realm) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);
  const filter = getFilterCriteria(filterList);

  let filteredResult = allResult.filtered(
    `isRemoved = false 
     AND isDeleted = false  
     AND isLocked != true 
     AND isAllowBatchAction = true
     AND (status = 0 OR status = 1)
     ${filter}
     `,
  );
  return filteredResult;
};

export const getFilterCriteria = (filterList) => {
  if (!filterList) {
    return '';
  }

  let filter = '';

  for (var x of filterList) {
    filter += ` AND ${x.key} = "${x.value}"`;
  }

  return filter;
};

export const updateJobTotalQuantity = (id, newTotalQuantity, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(Constants.JOB_SCHEMA, id);
    if (updateModel != null) {
      updateModel.totalQuantity = newTotalQuantity;
    }
  });
};

export const updateAllJobLatestETA = (realm) => {
  let allResult = realm.objects(Constants.JOB_SCHEMA);

  const result = [...JSON.parse(JSON.stringify(allResult))];

  if (result.some((job) => !job.sequence || !job.latestETA)) {
    return false;
  }

  let filteredResult = result
    .filter((c) => c.sequence !== null)
    .sort((a, b) => {
      if (a.sequence && b.sequence) {
        return a.sequence - b.sequence;
      } else if (a.sequence) {
        return -1;
      } else if (b.sequence) {
        return 1;
      }
      return 0;
    });

  let latestPodTime = new Date();

  // Find the last job with podTime and first job without podTime
  let lastPodTimeIndex = -1;
  let firstNullPodIndex = -1;
  for (let i = 0; i < filteredResult.length; i++) {
    if (filteredResult[i].podTime != null) {
      lastPodTimeIndex = i;
    } else if (firstNullPodIndex === -1) {
      firstNullPodIndex = i;
    }
  }

  if (lastPodTimeIndex !== -1 && firstNullPodIndex !== -1) {
    latestPodTime = new Date(filteredResult[lastPodTimeIndex].podTime);

    // Step 1: Calculate time differences for all remaining jobs
    const timeDiffs = [];
    for (let i = firstNullPodIndex; i < filteredResult.length; i++) {
      if (i > firstNullPodIndex) {
        const timeDiff = Math.abs(
          new Date(filteredResult[i].latestETA).getTime() -
            new Date(filteredResult[i - 1].latestETA).getTime(),
        );
        timeDiffs.push(timeDiff);
      } else {
        const timeDiff = Math.abs(
          new Date(filteredResult[i].latestETA).getTime() -
            new Date(filteredResult[firstNullPodIndex - 1].latestETA).getTime(),
        );
        timeDiffs.push(timeDiff);
      }
    }

    // Step 2: Apply calculated time differences to update latestETA
    for (let i = firstNullPodIndex; i < filteredResult.length; i++) {
      if (i === firstNullPodIndex) {
        const newEta =
          latestPodTime.getTime() + timeDiffs[i - firstNullPodIndex];
        filteredResult[i].latestETA = new Date(newEta).toISOString();
      } else {
        const newEta =
          new Date(filteredResult[i - 1].latestETA).getTime() +
          timeDiffs[i - firstNullPodIndex];
        filteredResult[i].latestETA = new Date(newEta).toISOString();
      }
    }

    for (let i = 0; i < filteredResult.length; i++) {
      updateJobData(filteredResult[i], realm);
    }

    return true;
  }

  return false;
};
