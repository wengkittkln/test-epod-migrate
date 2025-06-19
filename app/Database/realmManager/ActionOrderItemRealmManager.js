import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewActionOrderItem = (actionOrderItemModel, realm) => {
  realm.write(() => {
    realm.create(Constants.ACTION_ORDER_ITEM_SCHEMA, actionOrderItemModel);
  });
};

export const updateActionOrderItemData = (actionOrderItemModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.ACTION_ORDER_ITEM_SCHEMA,
      actionOrderItemModel.id,
    );

    if (
      actionOrderItemModel.orderItemId !== null &&
      typeof actionOrderItemModel.orderItemId !== 'undefined'
    ) {
      updateModel.orderItemId = actionOrderItemModel.orderItemId;
    }

    if (
      actionOrderItemModel.qty !== null &&
      typeof actionOrderItemModel.qty !== 'undefined'
    ) {
      updateModel.qty = actionOrderItemModel.qty;
    }

    if (
      actionOrderItemModel.orderId !== null &&
      typeof actionOrderItemModel.orderId !== 'undefined'
    ) {
      updateModel.orderId = actionOrderItemModel.orderId;
    }

    if (
      actionOrderItemModel.actionId !== null &&
      typeof actionOrderItemModel.actionId !== 'undefined'
    ) {
      updateModel.actionId = actionOrderItemModel.actionId;
    }

    if (
      actionOrderItemModel.expQty !== null &&
      typeof actionOrderItemModel.expQty !== 'undefined'
    ) {
      updateModel.expQty = actionOrderItemModel.expQty;
    }

    if (
      actionOrderItemModel.syncStatus !== null &&
      typeof actionOrderItemModel.syncStatus !== 'undefined'
    ) {
      updateModel.syncStatus = actionOrderItemModel.syncStatus;
    }

    if (
      actionOrderItemModel.desc !== null &&
      actionOrderItemModel.desc &&
      actionOrderItemModel.desc.length > 0
    ) {
      updateModel.desc = actionOrderItemModel.desc;
    }

    if (
      actionOrderItemModel.parentId !== null &&
      actionOrderItemModel.parentId &&
      actionOrderItemModel.parentId.length > 0
    ) {
      updateModel.operateTime = actionOrderItemModel.parentId;
    }

    if (
      actionOrderItemModel.uom !== null &&
      actionOrderItemModel.uom &&
      actionOrderItemModel.uom.length > 0
    ) {
      updateModel.uom = actionOrderItemModel.uom;
    }
  });
};

export const getActionOrderByParentId = (parentId, realm) => {
  let allResult = realm.objects(Constants.ACTION_ORDER_ITEM_SCHEMA);
  let filteredResult = allResult.filtered(`parentId = "${parentId}" `);
  return filteredResult;
};

export const getAllPendingActionOrderItemByActionId = (
  syncStatus,
  parentId,
  realm,
) => {
  let allResult = realm.objects(Constants.ACTION_ORDER_ITEM_SCHEMA);
  let filteredResult = allResult.filtered(
    `syncStatus =${syncStatus} AND parentId = "${parentId}" `,
  );
  return filteredResult;
};

export const queryAllActionOrderItemData = (realm) => {
  let allResult = realm.objects(Constants.ACTION_ORDER_ITEM_SCHEMA);
  return allResult;
};

export const deleteAllActionOrderItemData = (realm) => {
  realm.write(() => {
    let actionList = realm.objects(Constants.ACTION_ORDER_ITEM_SCHEMA);
    realm.delete(actionList);
  });
};
