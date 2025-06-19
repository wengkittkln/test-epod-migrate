import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  name: '',
  phoneNumber: '',
  truckNo: '',
  companyName: '',
};

const RegisterUserInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.INPUT_USERINFO_NAME:
      return {...state, name: action.payload.name};
    case Actions.INPUT_USERINFO_PHONE_NUMBER:
      return {...state, phoneNumber: action.payload.phoneNumber};
    case Actions.INPUT_USERINFO_TRUCKNO:
      return {...state, truckNo: action.payload.truckNo};
    case Actions.INPUT_USERINFO_COMPANY:
      return {...state, companyName: action.payload.companyName};
    case Actions.UPDATE_USERINFO:
      const userInfo = action.payload.userInfo;

      return {
        name: userInfo.name,
        phoneNumber: userInfo.phoneNumber,
        truckNo: userInfo.truckNo,
        companyName: userInfo.companyName,
      };
    case Actions.INPUT_USERINFO_RESET:
      return initialState;

    default:
      return state;
  }
};
export default RegisterUserInfoReducer;
