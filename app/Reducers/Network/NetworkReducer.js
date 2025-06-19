import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  isConnected: false,
};

const NetworkReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_NETWORK_CONNECTION:
      return {...state, isConnected: action.payload.isConnected};
    case Actions.NETWORK_RESET:
      return initialState;
    default:
      return state;
  }
};
export default NetworkReducer;
