import {combineReducers, createStore, applyMiddleware} from 'redux';
import LoginReducer from './Login/LoginReducer';
import NetworkReducer from './Network/NetworkReducer';
import LanguageReducer from './Language/LanguageReducer';
import UserReducer from './User/UserReducer';
import ManifestReducer from './Manifest/ManifestReducer';
import JobListReducer from './JobList/JobListReducer';
import SkuReducer from './JobList/SkuReducer';
import RegisterReducer from './Register/RegisterReducer';
import LocationReducer from './Location/LocationReducer';
import CameraReducer from './Camera/CameraReducer';
import AddOrderItemReducer from './Collect/AddOrderItemReducer';
import LoginModalReducer from './LoginModal/LoginModalReducer';
import RegisterUserInfoReducer from './Register/RegisterUserInfoReducer';
import JobTransferReducer from './JobTransfer/JobTransferReducer';
import JobTransferReducerV2 from './JobTransfer/JobTransferReducerV2';
import WatermarkReducer from './Watermark/WatermarkReducer';

const AppReducers = combineReducers({
  RegisterReducer,
  LoginReducer,
  NetworkReducer,
  LanguageReducer,
  UserReducer,
  ManifestReducer,
  JobListReducer,
  CameraReducer,
  LocationReducer,
  AddOrderItemReducer,
  LoginModalReducer,
  RegisterUserInfoReducer,
  JobTransferReducer,
  SkuReducer,
  JobTransferReducerV2,
  WatermarkReducer,
});

const rootReducer = (state, action) => {
  return AppReducers(state, action);
};

let store = createStore(rootReducer);

export default store;
