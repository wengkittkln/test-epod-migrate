import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewManifest = (manifestModel, realm) => {
  manifestModel.manifestId = Constants.MANIFEST_ID;

  const unique = manifestModel.orders.filter(
    ((set) => (order) => {
      const key = String(order.key);
      return !set.has(key) && set.add(key);
    })(new Set()),
  );

  manifestModel.orders = unique;

  const shopIds = [];

  for (var i of manifestModel.jobs) {
    if (i.shop) {
      if (shopIds.findIndex((x) => x === i.shop.id) > -1) {
        i.shop = null;
      } else {
        shopIds.push(i.shop.id);
      }
    }
  }

  manifestModel.orders = unique;

  realm.write(() => {
    realm.create(Constants.MANIFEST_SCHEMA, manifestModel);
  });
};

export const updateManifestData = (manifestModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.MANIFEST_SCHEMA,
      Constants.MANIFEST_ID,
    );
    if (updateModel) {
      if (updateModel.deliveryDate && manifestModel.deliveryDate) {
        updateModel.deliveryDate = manifestModel.deliveryDate;
      }
      updateModel.userId = manifestModel.userId;
      updateModel.status = manifestModel.status;
      updateModel.groupId = manifestModel.groupId;
      updateModel.groupIds = manifestModel.groupIds;
      updateModel.batch = manifestModel.batch;
      if (manifestModel.createdDate) {
        updateModel.createdDate = manifestModel.createdDate;
      }
      if (manifestModel.createdBy) {
        updateModel.createdBy = manifestModel.createdBy;
      }
      updateModel.isDeleted = manifestModel.isDeleted;
      updateModel.jobs = manifestModel.jobs;
      updateModel.orders = manifestModel.orders;
      updateModel.jobContainers = manifestModel.jobContainers;
      updateModel.orderItems = manifestModel.orderItems;
      updateModel.sequencedStatus = manifestModel.sequencedStatus;
      updateModel.isForcedSequencing = manifestModel.isForcedSequencing;
      updateModel.sequenceLimit = manifestModel.sequenceLimit;
    }
  });
};

export const queryAllManifestData = (realm) => {
  let allResult = realm.objects(Constants.MANIFEST_SCHEMA);
  return allResult;
};

export const deleteAllManifestData = (realm) => {
  realm.write(() => {
    let manifestList = realm.objects(Constants.MANIFEST_SCHEMA);
    let jobsList = realm.objects(Constants.JOB_SCHEMA);
    let jobBinsList = realm.objects(Constants.JOB_BIN_SCHEMA);
    let orderList = realm.objects(Constants.ORDER_SCHEMA);
    let orderItemList = realm.objects(Constants.ORDER_ITEM_SCHEMA);
    realm.delete(jobsList);
    realm.delete(jobBinsList);
    realm.delete(orderList);
    realm.delete(orderItemList);
    realm.delete(manifestList);
  });
};

export const geManifestByManifestId = async (manifestModel, realm) => {
  let allResult = realm.objects(Constants.MANIFEST_SCHEMA);
  let filteredResult = allResult.filtered(`id = ${manifestModel.id} `);

  return filteredResult;
};
