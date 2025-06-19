import * as Actions from '../../Actions/ActionTypes';
import * as Constants from '../../CommonConfig/Constants';

const initialState = {
  id: Constants.LanguageType.Chinese,
  title: '中文(繁體)',
  code: 'zh-Hant',
  momentLocale: 'zh-cn',
  acceptLanguage: 'zh-HK',
};

const LanguageReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_LANGUAGE:
      return {
        ...state,
        id: action.payload.id,
        title: action.payload.title,
        code: action.payload.code,
        momentLocale: action.payload.momentLocale,
      };
    case Actions.LANGUAGE_RESET:
      return initialState;
    default:
      return state;
  }
};
export default LanguageReducer;
