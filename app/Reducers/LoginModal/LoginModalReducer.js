import * as Actions from '../../Actions/ActionTypes';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';

const initialState = {
  isShowLoginModal: false,
  loginModalAlertMsg: '',
};

const LoginModalReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_IS_SHOW_LOGIN_MODAL:
      return {
        ...state,
        isShowLoginModal: action.payload.isShowLoginModal,
      };
    case Actions.SET_LOGIN_MODAL_ALERT_MSG:
      return {
        ...state,
        loginModalAlertMsg: action.payload.loginModalAlertMsg,
      };
    case Actions.LOGIN_MODAL_RESET:
      return initialState;
    default:
      return state;
  }
};
export default LoginModalReducer;
