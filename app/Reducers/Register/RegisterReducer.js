import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  email: '',
  phoneNo: '',
  company: '', // "first letter of company code " + company ID. requested added by benson
};

const RegisterReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.INPUT_REGISTER_USERNAME:
      return {...state, username: action.payload.username};
    case Actions.INPUT_NAME:
      return {...state, name: action.payload.name};
    case Actions.INPUT_REGISTER_PASSWORD:
      return {...state, password: action.payload.password};
    case Actions.INPUT_CONFIRM_PASSWORD:
      return {...state, confirmPassword: action.payload.confirmPassword};
    case Actions.INPUT_EMAIL:
      return {...state, email: action.payload.email};
    case Actions.INPUT_PHONE_NO:
      return {...state, phoneNo: action.payload.phoneNo};
    case Actions.INPUT_COMAPANY:
      return {...state, company: action.payload.company};
    case Actions.REGISTER_RESET:
      return initialState;
    default:
      return state;
  }
};
export default RegisterReducer;
