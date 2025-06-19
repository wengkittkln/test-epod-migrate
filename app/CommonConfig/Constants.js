import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {StyleSheet, Platform} from 'react-native';

//Async Storage Key
export const ACCESS_TOKEN = 'ACCESS_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const USER_MODEL = 'USER_MODEL';
export const LANGUAGE = 'LANGUAGE';
export const IS_DOWNLOAD_FAILED = 'IS_DOWNLOAD_FAILED';
export const LAST_DElTA_SYNC_TIME = 'LAST_DElTA_SYNC_TIME';
export const PENDING_ACTION_LIST = 'PENDING_ACTION_LIST'; //cache for pending action list
export const PLATE_NO = 'PLATE_NO';
export const IS_REFRESH = 'IS_REFRESH';
export const LAST_JOB_SINCE = 'LAST_JOB_SINCE';

//Error Message for Refresh Token
export const REFRESH_TOKEN_FAILED = 'REFRESH_TOKEN_FAILED';

export const EXPORT_PHOTO_ALBUM = 'KOOLPOD';

//Bluetooth
// export const BASE_UUID = 'AD8C1F1E-66C1-11EB-AE93-0242AC130002';
export const BASE_UUID = 'dbc8a0fc-a45d-451a-aa09-61fa2280e3c3';
// export const BASE_UUID = 'ad8c1f1e-66c1-11eb-ae93-0242ac130002';
export const primary_service_uuid = 'DB838584-66CA-11EB-AE93-0242AC130002';
// export const RECEIVER_BLUETOOTH_NAME_CHARACTERISTIC =
//   'A2B5D0BE-75A1-11EB-9439-0242AC130002';
export const RECEIVER_BLUETOOTH_NAME_CHARACTERISTIC =
  'dbc8a0fc-a45d-451a-aa09-61fa2280e3c3';
export const RECEIVER_BLUETOOTH_NAME_DID_END_CHARACTERISTIC =
  '718B3D74-79C7-11EB-9439-0242AC130002';
export const TRANSFER_JOBLIST_CHARACTERISTIC =
  'AD6F46B4-66CB-11EB-AE93-0242AC130002';
export const TRANSFER_JOBLIST_DID_END_CHARACTERISTIC =
  '23307642-732F-11EB-9439-0242AC130002';
export const TRANSFER_SELECTED_JOB_CHARACTERISTIC =
  '4D70D56A-7338-11EB-9439-0242AC130002';
export const ORI_BLUETOOTH_NAME = 'bluetooth_name';
export const TRANSFER_CANCEL_SELECTED_JOB_CHARACTERISTIC =
  '12AC1CBA-764D-11EB-9439-0242AC130002';
export const TRANSFER_JOB_DISCONNECT_CHARACTERISTIC =
  'C0100C2A-77F8-11EB-9439-0242AC130002';
export const TRANSFER_JOB_IS_SENDER_CONNECTED_CHARACTERISTIC =
  '4AA8A2BA-79AD-11EB-9439-0242AC130002';
export const TRANSFER_JOB_IS_CONFIRM = 'F3A7214C-79AE-11EB-9439-0242AC130002';
export const TRANSFER_JOB_IS_CANCEL = '0C04BF4C-79AF-11EB-9439-0242AC130002';
export const maxByteSize = 20;
export const BLUETOOTH_STATUS = {
  CONNECTED: 2,
  DISCONNECTED: 0,
};

//Secret Key
export const IV_KEY = 'iviviviviviviviv';
export const SECRET_PHASE = 'f95fd488-2a8d-47b2-854f-12bc760623e0';
export const AES_SALT = 'ePOD';

//UI
export const THEME_COLOR = '#ED6D00';
export const screenWidth = wp('100%%');
export const screenHeight = hp('100%');
export const normalFontSize = 14;
export const fontFamily = 'Roboto-Regular';
export const NoboSansFont = 'NotoSans-Regular';
export const NoboSansBoldFont = 'NotoSans-Bold';
export const buttonFontSize = 16;
export const textInputFonSize = 16;

//Color
export const Pending_Color = '#A0A0A0';
export const Shipping_Color = '#29B6F6';
export const Completed_Color = '#41C300';
export const Failed_Color = '#E53935';
export const Partial_Delivery_Color = '#EAC807';
export const Text_Color = '#4C4948';
export const WHITE = '#FFFFFF';
export const Dark_Grey = '#4C4948';
export const Light_Grey = '#E0E0E0';
export const Disable_Color = '#A0A0A0';
export const Order_Item_Color = '#909090';
export const Light_Grey_Underlay = '#D1D1D1';
export const Green_Underlay = '#308C02';
export const Red_Underlay = '#B72D2A';
export const Alert_Color = '#fea4a2';
export const Expensive_highlight = 'rgba(250,28,12,0.2)';

export const navStyles = StyleSheet.create({
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 24,
  },
});

//Error Code
export const NO_MANIFEST_ERROR_CODE = 204;
export const ACTIVATE_CODE_ERROR_CODE = '1009';

//Enum

export const ReleaseMode = {
  Staging: 1,
  Uat: 2,
  Production: 3,
  Stg: 4,
  PreProd: 5,
};

export const LanguageType = {
  Chinese: 1,
  English: 2,
  Vietnam: 3,
  Korean: 4,
  Thailand: 5,
  Cambodia: 6,
};

export const locationErrorCode = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
  PLAY_SERVICE_NOT_AVAILABLE: 4,
  SETTINGS_NOT_SATISFIED: 5,
  INTERNAL_ERROR: -1,
};

export const ActionType = {
  TAKE_PHOTO: 1,

  GENERAL_CALL_START: 9,
  GENERAL_CALL_SUCCESS: 10,
  GENERAL_CALL_FAIL: 11,

  PRE_CALL_SUCCESS: 20,
  PRE_CALL_FAIL: 21,
  PRE_CALL_SKIP: 22,
  POD_SUCCESS: 30,
  POD_FAIL: 31,
  PARTIAL_DLEIVER_FAIL: 32,
  ESIGNATURE_POD: 33,
  BARCODE_POD: 34,
  BARCODEESIGN_POD: 36,
  SKU_POD: 37,
  ESIGNBARCODE_POD: 38,
  RESEND: 40,

  COLLECT_SUCCESS: 60,
  COLLECT_FAIL: 61,
  RECOLLECT: 62,

  JOB_TRANSFER: 80,
  JOB_RECEIVE: 81,

  ESIGNATURE_POC: 113,
  POC_SUCCESS: 114,
  POC_FAIL: 115,
};

export const SyncStatus = {
  SYNC_PENDING: 0,
  SYNC_SUCCESS: 10,
  PENDING_SELECT_PHOTO: 20, // Not directly used by UploadProgressScreen query but part of existing definition
  SYNC_LOCK: 30,
  SYNC_FAILED: 40, // Added for failed status
  SYNC_PARTIAL_SUCCESS: 50, // Added for partially successful syncs (e.g., action synced, photos pending)
};

export const SourceType = {
  CAMERA: 0,
  PHOTO_GALLERY: 1,
  ESIGNATURE: 2,
  ESIGNATURE_WITHOUT_ORDER_NUMBER: 3,
};

export const JobStatus = {
  ALL: 99,
  OPEN: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  FAILED: 3,
  PARTIAL_DELIVERY: 4,
  CANCEL: 5,
  DOWNLOADED: 6, // manifest status
};

export const JobType = {
  DELIVERY: 0,
  PICK_UP: 1,
  ALL: -1,
};

export const StepCode = {
  PRE_CALL: 'PRE_CALL',
  SIMPLE_POD: 'SIMPLE_POD',
  COLLECT: 'COLLECT',
  ESIGN_POD: 'ESIGN_POD',
  BARCODE_POD: 'BARCODE_POD',
  BARCODEESIGN_POD: 'BARCODEESIGN_POD',
  VERIFY_QTY: 'VERIFY_QTY',
  ESIGNBARCODE_POD: 'ESIGNBARCODE_POD',
  SCAN_QR_POD: 'SCAN_QR_POD',
  WEIGHT_CAPTURE: 'WEIGHT_CAPTURE',
  ESIGN_POC: 'ESIGN_POC',
  PRE_CALL_COLLECT: 'PRE_CALL_COLLECT',
};

export const ReasonAction = {
  NO_ADDITIONAL_ACTION: 0,
  NEED_PHOTO: 1,
  NEED_SCANQR: 2,
};

export const ReasonType = {
  POD_EX: 0,
  PHOTO_REASON: 1,
  CALL_REASON: 2, //reason before general call
  PRECALL_EX_REASON: 3, //reason after precall and generalcall
  PRECALL_SKIP_REASON: 4,
  COLLECT_EX_REASON: 5,
  PARTIAL_DELIVERY_EX_REASON: 6,
  JOB_TRANSFER_REASON: 7,
  COD_REASON: 8,
  BARCODEPOD_SKIP_REASON: 9,
  POD_REASON: 10,
  FAIL_FOOD_WASTE_REASON: 11,
  POC_REASON: 12,
  POC_EX: 13,
};

//Language List
export const languageList = [
  {
    id: LanguageType.Chinese,
    title: '中文(繁體)',
    code: 'zh-Hant',
    momentLocale: 'zh-cn',
    acceptLanguage: 'zh-HK',
  },
  {
    id: LanguageType.English,
    title: 'English',
    code: 'en',
    momentLocale: 'en',
    acceptLanguage: 'zh-US',
  },
  {
    id: LanguageType.Vietnam,
    title: 'Tiếng việt nam',
    code: 'vi',
    momentLocale: 'vi',
    acceptLanguage: 'vi',
  },
  {
    id: LanguageType.Korean,
    title: '한국어',
    code: 'kr',
    momentLocale: 'kr',
    acceptLanguage: 'kr',
  },
  {
    id: LanguageType.Thailand,
    title: 'ไทย',
    code: 'th',
    momentLocale: 'th',
    acceptLanguage: 'th',
  },
  {
    id: LanguageType.Cambodia,
    title: 'ឝ្មែរ',
    code: Platform.OS === 'android' ? 'km_KH' : 'km',
    momentLocale: Platform.OS === 'android' ? 'km_KH' : 'km',
    acceptLanguage: 'km-KH',
  },
];

export const CURRENT_RELEASE_MODE = ReleaseMode.Uat;

//Schema
export const MANIFEST_SCHEMA = 'MANIFEST_SCHEMA';
export const JOB_SCHEMA = 'JOB_SCHEMA';
export const ACTION_ORDER_ITEM_SCHEMA = 'ACTION_ORDER_ITEM_SCHEMA';
export const ACTION_SCHEMA = 'ACTION_SCHEMA';
export const ATTACHMENT_SCHEMA = 'ATTACHMENT_SCHEMA';
export const CALL_LOG_SCHEMA = 'CALL_LOG_SCHEMA';
export const DELTA_SCHEMA = 'DELTA_SCHEMA';
export const DEVICE_SCHEMA = 'DEVICE_SCHEMA';
export const CUSTOMER_STEP_SCHEMA = 'CUSTOMER_STEP_SCHEMA';
export const CUSTOMER_SCHEMA = 'CUSTOMER_SCHEMA';
export const MASTER_DATA_SCHEMA = 'MASTER_DATA_SCHEMA';
export const ORDER_SCHEMA = 'ORDER_SCHEMA';
export const ORDER_ITEM_SCHEMA = 'ORDER_ITEM_SCHEMA';
export const REASON_SCHEMA = 'REASON_SCHEMA';
export const VEHICLE_LOCATION_SCHEMA = 'VEHICLE_LOCATION_SCHEMA';
export const USER_JWT_SCHEMA = 'USER_JWT_SCHEMA';
export const USER_SCHEMA = 'USER_SCHEMA';
export const USERS_SCHEMA = 'USERS_SCHEMA';
export const PHOTO_ENTRY_SCHEMA = 'PHOTO_ENTRY_SCHEMA';
export const CUSTOMER_CONFIGURATION_SCHEMA = 'CUSTOMER_CONFIGURATION_SCHEMA';
export const JOB_TRANSFER_SCHEMA = 'JOB_TRANSFER_SCHEMA';
export const LOG_SCHEMA = 'LOG_SCHEMA';
export const JOB_CONTAINER_SCHEMA = 'JOB_CONTAINER_SCHEMA';
export const SHOPS_SCHEMA = 'SHOPS_SCHEMA';
export const CONFIGURATION_SCHEMA = 'CONFIGURATION_SCHEMA';
export const JOB_BIN_SCHEMA = 'JOB_BIN_SCHEMA';
export const JOB_SORT_SCHEMA = 'JOB_SORT_SCHEMA';

export const SCHEMA_VERSION = 31;
export const MANIFEST_ID = 1;
export const MASTER_DATA_ID = 1;

//uom List
export const uomList = [
  {key: 1, label: 'SHEET'},
  {key: 2, label: 'BOTTLE'},
  {key: 3, label: 'KIT'},
  {key: 4, label: 'TIN'},
  {key: 5, label: 'BOX'},
  {key: 6, label: 'ROLL'},
  {key: 7, label: 'PCS'},
  {key: 8, label: 'PACK'},
  {key: 9, label: 'EA'},
];

export const QRType = {
  ORDER_NUMBER: 1,
  JOB_TRANSFER: 2,
  E_SIGN: 3,
  MANIFEST_QR: 4,
  Container_Id: 6,
  BARCODE_POD: 7,
  SHOP_BARCODE_POD: 8,
  REMOVE_ALLJOB: 99,
  //should be 5
  DO_QR: 'DO',
};

export const QR_POSITION = {
  APP_NAME: 0,
  TYPE: 1,
  MANIFEST_OR_USER_ID: 2,
  COMPANY_ID: 3,
  BLUETOOTH_NAME: 4,
  TIME: 5,
};

export const DATA_TYPE = {
  RECEICVER_DATA: '001',
  DEFAULT_DATA: '002',

  JOB_CLICKED: '010',

  CONFIRM_BTN_CLICK: '100', //notify oponent when click on button
  ACCEPTED_CONFRM_CLICK: '101',
  REJECTED_CONFRM_CLICK: '102',

  SAVE_DATA_COMPLETE: '110',
};

export const VERIFICATION_METHOD = {
  PASSWORD_TYPE: 'password',
  SHOP_PASSWORD_TYPE: 'shoppassword',
  QR_TYPE: 'qr',
  SHOP_QR: 'shopqr',
};

export const DRIVER_TYPE = {
  STABLE: 0,
  SUBCONTRACTOR: 1,
};
export const IS_LOGGED_IN = 'IS_LOGGED_IN';
export const FORCE_LOGOUT_TIME_LIMIT = 180;
export const JT_MAX_LIMIT_QR = 1200;

export const JobTransferStatus = {
  OPEN: -1,
  PENDING: 0,
  CANCELLED: 1,
  REJECTED: 2,
  COMPLETED: 3,
};

export const TRACKING_MAP_URL_TRIAL =
  'https://epod-trial.hk.kln.com/admin/#/tracking/mobile?';

export const TRACKING_MAP_URL_PROD =
  'https://epod.hk.kln.com/admin/#/tracking/mobile?';

export const TRACKING_MAP_URL_STG =
  'http://172.27.8.146:4200/#/tracking/mobile?';

export const TRACKING_MAP_URL_PRE =
  'https://epod-preprod.hk.kln.com/admin/#/tracking/mobile?';

export const ADMIN_URL =
  CURRENT_RELEASE_MODE === ReleaseMode.Uat
    ? 'https://epod-trial.hk.kln.com/admin#'
    : CURRENT_RELEASE_MODE === ReleaseMode.PreProd
    ? 'https://epod-preprod.hk.kln.com/admin#'
    : CURRENT_RELEASE_MODE === ReleaseMode.Production
    ? 'https://epod.hk.kln.com/admin#'
    : 'https://epod-trial.hk.kln.com/admin#';
