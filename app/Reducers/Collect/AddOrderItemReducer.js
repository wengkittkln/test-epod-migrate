import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  id: 0,
  description: '',
  quantity: 0,
  expectedQuantity: 0,
  uom: '',
  orderId: 0,
  cbm: 0.0,
  lineItem: 0,
  weight: 0,
  isDeleted: false,
  isAddedFromLocal: true,
};

const AddOrderItemReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.INPUT_PRODUCT_NAME:
      return {...state, description: action.payload.productName};

    case Actions.INPUT_UOM:
      return {...state, uom: action.payload.uom};

    case Actions.INPUT_QUANTITY:
      return {...state, quantity: action.payload.quantity};

    case Actions.ORDER_ITEM_RESET:
      return initialState;

    case Actions.UPDATE_ORDER_ITEM:
      return {
        ...state,
        id: action.payload.id,
        description: action.payload.description,
        quantity: action.payload.quantity,
        expectedQuantity: action.payload.expectedQuantity,
        uom: action.payload.uom,
        orderId: action.payload.orderId,
        cbm: action.payload.cbm,
        lineItem: action.payload.lineItem,
        weight: action.payload.weight,
      };

    default:
      return state;
  }
};
export default AddOrderItemReducer;
