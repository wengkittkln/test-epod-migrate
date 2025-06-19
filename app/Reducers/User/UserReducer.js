import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  id: 0,
  name: '',
  truckNo: '',
  phoneNumber: '',
  username: '',
  driverType: -1,
  companyId: -1,
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_USER_MODEL:
      return {
        ...state,
        id: action.payload.id,
        name: action.payload.name,
        truckNo: action.payload.truckNo,
        phoneNumber: action.payload.phoneNumber,
        username: action.payload.username,
        driverType: action.payload.driverType,
        companyId: action.payload.companyId,
      };
    case Actions.SET_USER_ID:
      return {
        ...state,
        id: action.payload.id,
      };
    case Actions.SET_USERNAME:
      return {
        ...state,
        name: action.payload.name,
      };
    case Actions.SET_TRUCK_NO:
      return {
        ...state,
        truckNo: action.payload.truckNo,
      };
    case Actions.SET_PHONE_NO:
      return {
        ...state,
        phoneNumber: action.payload.phoneNumber,
      };
    case Actions.RESET_USER_MODEL:
      return initialState;
    default:
      return state;
  }
};
export default UserReducer;
