import * as OrderItemRealmManager from '../Database/realmManager/OrderItemRealmManager';
import * as JobRealmManager from '../Database/realmManager/JobRealmManager';
import * as GeneralHelper from '../Helper/GeneralHelper';

export const getTotalCOD = (orderList) => {
  let value = 0;
  let price = '';
  orderList.map((item) => {
    value = value + item.codAmount;
  });
  if (orderList && orderList > 0) {
    price = orderList[0] + ' ' + value;
  } else {
    price = value;
  }

  return price;
};

export const getAllOrderItems = (realm, orderList, jobId = 0) => {
  const orderItems = [];
  const temp = [];
  const containerItems = [];
  const normalSku = [];
  const expensiveSku = [];

  orderList.forEach((orderModel) => {
    const seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
      orderModel.id,
      realm,
    );
    const orderItemsList = seletedOrderItems.map((item) => {
      let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
      orderItemModel.isSkuScanned = !orderItemModel.skuCode ? true : false;
      orderItemModel.quantity = item.expectedQuantity - item.quantity;
      if (orderItemModel.quantity && orderItemModel.quantity > 0) {
        orderItemModel.expectedQuantity = orderItemModel.quantity;
      }
      return orderItemModel;
    });
    temp.push(...orderItemsList);
  });

  if (jobId > 0) {
    let selectedContainer = JobRealmManager.getJobContainersByJobId(
      jobId,
      realm,
    );

    if (selectedContainer && selectedContainer.length > 0) {
      for (var i of selectedContainer) {
        let temp = JSON.parse(JSON.stringify(i));
        temp.skuCode = '';
        containerItems.push(temp);
      }
      // orderItems.push(...selectedContainer);
    }
  }

  for (var i of temp) {
    if (i.isExpensive === false) {
      normalSku.push(i);
    } else {
      expensiveSku.push(i);
    }
  }

  if (expensiveSku) {
    orderItems.push(...expensiveSku);
  }

  if (containerItems) {
    orderItems.push(...containerItems);
  }

  orderItems.push(...normalSku);
  return orderItems;
};
