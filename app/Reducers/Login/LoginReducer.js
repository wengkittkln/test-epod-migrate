import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  username: '',
  password: '',
};

const LoginReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.INPUT_USERNAME:
      return {...state, username: action.payload.username};
    case Actions.INPUT_PASSWORD:
      return {...state, password: action.payload.password};
    case Actions.LOGIN_RESET:
      return initialState;
    default:
      return state;
  }
};
export default LoginReducer;
