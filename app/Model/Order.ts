export type Order = {
  id: number;
  orderNumber: string;
};

export type VerifyOrderList = {
    id: number;
    orderNumber: string;
    item: OrderItem[];
};

export type OrderItem = {
    id: number;
    cbm: number;
    cbmUnit: string;
    orderNumber: string;
    description: string;
    lineItem: number;
    orderId: number;
    quantity: number;
    verifyQuantity: number;
    remark: string;
    expectedQuantity: number;
    uom: string;
    sku: string;
    skuCode: string;
    weight: number;
    isExpensive: boolean;
    isAddedFromLocal: boolean;
    isDeleted: boolean;
    weightUnit: string;
    backgroundColor: string;
    textColor: string;
    isContainer: boolean;
  };
