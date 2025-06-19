import * as Actions from '../../Actions/ActionTypes';

const initialState = {
    selected: [],
    status: 0,
};

export default (state = initialState, action: { type: any; payload: any; }) => {
  switch (action.type) {
    case Actions.SET_JOB_TRANSFER_SELECTED_ITEMS:
      return {
        ...state,
        selected: action.payload.selected,
      };    
      case Actions.SET_JOB_TRANSFER_STATUS:
      return {
        ...state,
        status: action.payload.status,
      };
    default:
      return state;
  }
};
