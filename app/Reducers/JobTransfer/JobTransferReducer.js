import moment from 'moment';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import * as Actions from '../../Actions/ActionTypes';

const initialState = {
  device: {},
  fromManifest: -1,
  toManifest: -1,
  fromUser: {},
  toUser: {},
  jobs: [],
  selectedJobs: [],
  orders: [],
  orderItems: [],
  customers: [],
  customerStep: [],
  reason: [],
  transferStartTime: '',
  reasonDescription: '',
  transferId: '',
  isRecieveEnd: false,
  receivedSelectedJobId: -1,
  receivedCancelSelectedJobId: -1,
  isDisconnected: false,
  isLossConnectionModalVisible: false,
  isSenderConnected: false,
  isConfirmJobTransfer: false,
  isCancelJobTransfer: false,
  action: {},
  receiverBluetoothName: '',
  isDoneTransfer: false,
  receiverData: null, // first message trigger by recipient
  isDisconnectTrigger: false,
  isBTHasSignal: false,
  isBTConnectionError: false,
  connectedDevice: {},
};

const JobTransferReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_JOB_TRANSFER_ACTION:
      return {
        ...state,
        action: action.payload.action,
      };
    case Actions.SET_CONNECTED_DEIVCE:
      return {
        ...state,
        device: action.payload.device,
        connectedDevice: action.payload.device,
      };
    case Actions.SET_IS_DISCONNECTED_FLAG:
      return {
        ...state,
        isDisconnected: action.payload.isDisconnected,
      };
    case Actions.SET_IS_LOSS_CONNECTION_MODAL_VISIBLE:
      return {
        ...state,
        isLossConnectionModalVisible:
          action.payload.isLossConnectionModalVisible,
      };
    case Actions.SET_IS_SENDER_CONNECTED:
      return {
        ...state,
        isSenderConnected: action.payload.isSenderConnected,
      };
    case Actions.SET_IS_CONFRIM_JOB_TRANSFER:
      return {
        ...state,
        isConfirmJobTransfer: action.payload.isConfirmJobTransfer,
      };
    case Actions.SET_IS_CANCEL_JOB_TRANSFER:
      return {
        ...state,
        isCancelJobTransfer: action.payload.isCancelJobTransfer,
      };
    case Actions.SET_TRANSFER_DATA:
      const transferData = action.payload.tansferData;

      return {
        ...state,
        fromManifest: {},
        toManifest: {},
        fromUser: {},
        toUser: {},
        jobs: [],
        orders: [],
        orderItems: [],
        customers: [],
        customerStep: [],
        reason: [],
        transferStartTime: moment().format(),
        reasonDescription: '',
        transferId: '',
      };

    case Actions.SET_SENDER_TRANSFER_DATA:
      return {
        ...state,
        toManifest: action.payload.toManifest,
        toUser: action.payload.toUser,
        transferStartTime: action.payload.transferStartTime,
        receiverBluetoothName: action.payload.receiverBluetoothName,
        receiverData: action.payload.receiverData,
      };

    case Actions.SET_RECEIVER_TRANSFER_DATA:
      return {
        ...state,
        jobs: action.payload.jobs,
        orders: action.payload.orders,
        orderItems: action.payload.orderItems,
        customers: action.payload.customers,
        fromManifest: action.payload.fromManifest,
        fromUser: action.payload.fromUser,
        transferStartTime: action.payload.transferStartTime,
        reasonDescription: action.payload.reasonDescription,
        transferId: action.payload.transferId,
        reason: action.payload.reason,
        customerStep: action.payload.customerStep,
      };

    case Actions.UPDATE_JOBS_DATA:
      return {
        ...state,
        jobs: action.payload.jobs,
      };
    case Actions.UPDATE_SELECTED_JOBS_DATA:
      return {
        ...state,
        selectedJobs: action.payload.selectedJobs,
      };
    case Actions.UPDATE_IS_RECEIVE_END:
      return {
        ...state,
        isRecieveEnd: action.payload.isRecieveEnd,
      };
    case Actions.SET_IS_DONE_TRANSFER:
      return {
        ...state,
        isDoneTransfer: action.payload.isDoneTransfer,
      };
    case Actions.UPDATE_RECEIVE_SELECTED_JOB_ID:
      return {
        ...state,
        receivedSelectedJobId: action.payload.receivedSelectedJobId,
      };
    case Actions.UPDATE_RECEIVE_CANCEL_SELECTED_JOB_ID:
      return {
        ...state,
        receivedCancelSelectedJobId: action.payload.receivedCancelSelectedJobId,
      };
    case Actions.RESET_SELECTED_AND_CANCEL_SELECT_JOB_ID:
      return {
        ...state,
        receivedSelectedJobId: -1,
        receivedCancelSelectedJobId: -1,
      };
    case Actions.SET_IS_DISCONNECT_TRIGGER: {
      return {
        ...state,
        isDisconnectTrigger: action.payload.isDisconnectTrigger,
      };
    }
    case Actions.SET_IS_BT_HAS_SIGNAL: {
      return {
        ...state,
        isBTHasSignal: action.payload.isBTHasSignal,
      };
    }
    case Actions.SET_IS_BT_CONNECTION_ERROR: {
      return {
        ...state,
        isBTConnectionError: action.payload.isBTConnectionError,
      };
    }
    case Actions.TRANSFER_DATA_RESET:
      return initialState;
    default:
      return state;
  }
};
export default JobTransferReducer;
