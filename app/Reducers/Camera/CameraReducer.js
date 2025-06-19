import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  photos: [],
};

const CameraReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_PENDING_PHOTO:
      return {...state, photos: action.payload.photos};

    case Actions.ADD_PENDING_PHOTO:
      return {...state, photos: state.photos.concat(action.payload.photos)};

    case Actions.DELETE_PENDING_PHOTO:
      return {
        ...state,
        photos: state.photos.filter(
          (photo) => photo.uuid !== action.payload.photo.uuid,
        ),
      };

    default:
      return state;
  }
};
export default CameraReducer;
