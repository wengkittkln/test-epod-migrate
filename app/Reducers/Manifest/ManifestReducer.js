import * as Actions from '../../Actions/ActionTypes';

const initialState = {lastSyncDate: ''};

const ManifestReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_LAST_SYNC_DATE:
      return {...state, lastSyncDate: action.payload.lastSyncDate};
    case Actions.RESET_LAST_SYNC_DATE:
      return initialState;
    default:
      return state;
  }
};
export default ManifestReducer;
