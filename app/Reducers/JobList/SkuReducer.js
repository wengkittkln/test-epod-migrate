import * as Actions from '../../Actions/ActionTypes';


const initialState = {
  orderItems: [],
  isRefresh: false,
  isDelete: false,
  orderItem: {},
  resumeScanSku: false
};


const SkuReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_SKU_ORDER_ITEMS:
      return {
        ...state,
        orderItems: action.payload.orderItems,
        isRefresh: action.payload.isRefresh,
      };
    case Actions.DELETE_SKU_ORDER_ITEMS:
      return {
        ...state,
        orderItem: action.payload.orderItem,
        isDelete: action.payload.isDelete,
      };
    default:
      return state;
  }
};
export default SkuReducer;