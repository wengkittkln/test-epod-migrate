import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewOrderItem = (orderItemModel, realm) => {
  realm.write(() => {
    realm.create(Constants.ORDER_ITEM_SCHEMA, orderItemModel);
  });
};

export const getOrderItemsByOrderId = (orderId, realm) => {
  let allResult = realm.objects(Constants.ORDER_ITEM_SCHEMA);
  let filteredResult = allResult.filtered(
    `orderId = ${orderId} SORT(isExpensive DESC)`,
  );
  return filteredResult;
};

export const getOrderItemsByJobId = (jobId, realm) => {
  let allResult = realm.objects(Constants.ORDER_ITEM_SCHEMA);
  let filteredResult = allResult.filtered(
    `jobId = ${jobId} SORT(isAddedFromLocal ASC)`,
  );
  return filteredResult;
};

export const updateOrderItemById = (
  orderItemModel,
  realm,
  isContainer = false,
) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      !isContainer
        ? Constants.ORDER_ITEM_SCHEMA
        : Constants.JOB_CONTAINER_SCHEMA,
      orderItemModel.id,
    );

    if (orderItemModel.cbm !== null) {
      updateModel.cbm = orderItemModel.cbm;
    }

    if (
      (orderItemModel.cbmUnit && orderItemModel.cbmUnit.length > 0) ||
      orderItemModel.cbmUnit === null
    ) {
      updateModel.cbmUnit = orderItemModel.cbmUnit;
    }

    if (
      (orderItemModel.description && orderItemModel.description.length > 0) ||
      orderItemModel.description === null
    ) {
      updateModel.description = orderItemModel.description;
    }

    if (orderItemModel.lineItem !== null) {
      updateModel.lineItem = orderItemModel.lineItem;
    }

    if (orderItemModel.orderId !== null) {
      updateModel.orderId = orderItemModel.orderId;
    }

    if (orderItemModel.quantity !== null) {
      updateModel.quantity = orderItemModel.quantity;
    }

    if (
      (orderItemModel.remark && orderItemModel.remark.length > 0) ||
      orderItemModel.remark === null
    ) {
      updateModel.remark = orderItemModel.remark;
    }

    if (
      (orderItemModel.sku && orderItemModel.sku.length > 0) ||
      orderItemModel.sku === null
    ) {
      updateModel.sku = orderItemModel.sku;
    }

    if (
      (orderItemModel.uom && orderItemModel.uom.length > 0) ||
      orderItemModel.uom === null
    ) {
      updateModel.uom = orderItemModel.uom;
    }

    if (orderItemModel.weight !== null) {
      updateModel.weight = orderItemModel.weight;
    }

    if (
      (orderItemModel.weightUnit && orderItemModel.weightUnit.length > 0) ||
      orderItemModel.weightUnit === null
    ) {
      updateModel.weightUnit = orderItemModel.weightUnit;
    }

    if (orderItemModel.isAddedFromLocal !== null) {
      updateModel.isAddedFromLocal = orderItemModel.isAddedFromLocal;
    }

    if (orderItemModel.expectedQuantity !== null) {
      updateModel.expectedQuantity = orderItemModel.expectedQuantity;
    }

    if (orderItemModel.isDeleted !== null) {
      updateModel.isDeleted = orderItemModel.isDeleted;
    }
  });
};

export const getAllOrderItem = (realm) => {
  return realm.objects(Constants.ORDER_ITEM_SCHEMA);
};

export const getOrderItemById = (orderItemModel, realm) => {
  return realm.objectForPrimaryKey(
    Constants.ORDER_ITEM_SCHEMA,
    orderItemModel.id,
  );
};

export const deleteOrderItem = (item, realm) => {
  realm.write(() => {
    let orderItem = getOrderItemById(item, realm);
    realm.delete(orderItem);
  });
};

export const updateOrderItemVerifyQuantityId = (orderItemModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      !orderItemModel.isContainer
        ? Constants.ORDER_ITEM_SCHEMA
        : Constants.JOB_CONTAINER_SCHEMA,
      orderItemModel.id,
    );
    if (
      orderItemModel.verifyQuantity !== null ||
      orderItemModel.verifyQuantity !== undefined
    ) {
      updateModel.verifyQuantity = orderItemModel.verifyQuantity;
    }
  });
};

export const updateOrderItemQuantity = (orderItemModel, newQuantity, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      !orderItemModel.isContainer
        ? Constants.ORDER_ITEM_SCHEMA
        : Constants.JOB_CONTAINER_SCHEMA,
      orderItemModel.id,
    );

    updateModel.quantity = newQuantity;
  });
};

export const updateOrderItemExpQuantity = (
  orderItemModel,
  newQuantity,
  realm,
) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      !orderItemModel.isContainer
        ? Constants.ORDER_ITEM_SCHEMA
        : Constants.JOB_CONTAINER_SCHEMA,
      orderItemModel.id,
    );

    updateModel.expectedQuantity = newQuantity;
  });
};
