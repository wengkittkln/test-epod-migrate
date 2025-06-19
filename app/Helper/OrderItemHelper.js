export const getTotalQuantity = (orderItemList) => {
  let expectedQuantity = 0;
  let quantity = 0;
  orderItemList.map((item) => {
    expectedQuantity = expectedQuantity + item.expectedQuantity; //Total quantity
    quantity = quantity + item.quantity; // delivery count
  });

  return quantity + '/' + expectedQuantity;
};

export const getQuantity = (orderItemList) => {
  let value = 0;
  orderItemList.map((item) => {
    value = value + item.quantity;
  });

  return value;
};

export const getTotalExpectedQuantity = (orderItemList) => {
  let expectedQuantity = 0;
  orderItemList.map((item) => {
    expectedQuantity = expectedQuantity + item.expectedQuantity; //Total quantity
  });

  return expectedQuantity;
};
