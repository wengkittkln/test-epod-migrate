import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  latitude: 0,
  longitude: 0,
  operateTime: '',
};

const LocationReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_LOCATION:
      return {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        operateTime: action.payload.operateTime,
      };
    case Actions.RESET_LOCATION:
      return initialState;
    default:
      return state;
  }
};
export default LocationReducer;
