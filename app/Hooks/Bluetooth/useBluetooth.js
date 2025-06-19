import React, {useEffect, useState, useRef} from 'react';
import {NativeModules, NativeEventEmitter, Platform, Alert} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Peripheral, {Service, Characteristic} from 'react-native-peripheral';
import CryptoJS from 'crypto-js';
import {Base64} from 'js-base64';
import BleManager from 'react-native-ble-manager';
import BLEPeripheral from 'react-native-ble-peripheral';
import BluetoothSerial from 'react-native-bluetooth-serial';
import {Buffer} from 'buffer';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RootNavigation from '../../rootNavigation';
import * as Constant from '../../CommonConfig/Constants';
import * as ActionType from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';
import {toUTF8Array, Utf8ArrayToStr} from '../../Helper/QrCodeHelper';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let blePeripheralEmitter = null;
let toastRef;

if (Platform.OS === 'android') {
  const BlePeripheralModule = NativeModules.BLEPeripheral;
  blePeripheralEmitter = new NativeEventEmitter(BlePeripheralModule);
}

export const useBluetooth = () => {
  const userModel = useSelector((state) => state.UserReducer);
  const jobTransferModel = useSelector((state) => state.JobTransferReducer);
  const dispatch = useDispatch();
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const [hasSignal, setHasSignal] = useState(false);
  const [secs, setSecs] = useState(80);
  // const bluetoothName = 'ePOD_' + userModel.name + '_' + userModel.truckNo;
  const bluetoothName = 'ePOD_' + userModel.id.toString(); // max 31 bytes else cant be advertised
  let receivedDataString = '';
  let senderBluetoothDataString = '';
  let receiverBluetoothName = '';

  const ch_sender_bluetooth_name = new Characteristic({
    uuid: Constant.RECEIVER_BLUETOOTH_NAME_CHARACTERISTIC,
    properties: ['read', 'write', 'notify', 'writeWithoutResponse'],
    permissions: ['readable', 'writeable'],
    onReadRequest: async (offset?: number) => {},
    onWriteRequest: async (value: string, offset?: number) => {
      const decodedValue = Base64.decode(value);
      handleIncomingMessage(decodedValue);
    },
  });

  const service =
    Platform.OS === 'ios'
      ? new Service({
          uuid: Constant.BASE_UUID,
          characteristics: [ch_sender_bluetooth_name],
        })
      : Constant.BASE_UUID;

  const setToastRef = (messageToastRef) => {
    toastRef = messageToastRef;
  };
  const handleDiscoverPeripheral = (peripheral) => {};

  const connectToPeripheral = (peripheral) => {};

  const startAdvertising = () => {
    if (Platform.OS === 'android') {
      BLEPeripheral.addService(service, true);
      BLEPeripheral.setName(bluetoothName);
      BLEPeripheral.addCharacteristicToService(
        Constant.BASE_UUID,
        Constant.RECEIVER_BLUETOOTH_NAME_CHARACTERISTIC,
        1 | 16,
        1 | 2 | 8 | 16 | 4,
      );
      BLEPeripheral.isAdvertising().then((res) => {
        BLEPeripheral.start()
          .then((out) => {
            // alert('advertise success');
          })
          .catch((e) => console.log('advertise fail', e));
      });
    } else {
      Peripheral.isAdvertising()
        .then((res) => {
          Peripheral.addService(service).then(() => {
            // start advertising to make your device discoverable
            Peripheral.startAdvertising({
              name: bluetoothName,
              serviceUuids: [Constant.BASE_UUID],
            });
          });
        })
        .catch((e) => {
          console.log('ios advertise error', e);
        });
    }
  };

  const stopAdvertising = () => {
    if (Platform.OS === 'android') {
      BLEPeripheral.isAdvertising().then((res) => {
        if (res) {
          BLEPeripheral.stop();
        }
      });
    } else {
      Peripheral.isAdvertising().then((res) => {
        if (res) {
          Peripheral.stopAdvertising();
        }
      });
    }
  };

  const handleBTStatusDisconnect = (connection) => {
    if (
      !jobTransferModel.isDisconnectTrigger &&
      !jobTransferModel.isRecieveEnd
    ) {
      const payload = {
        isLossConnectionModalVisible: true,
      };
      dispatch(
        createAction(ActionType.SET_IS_LOSS_CONNECTION_MODAL_VISIBLE, payload),
      );
      const disconnectPayload = {
        isDisconnectTrigger: true,
      };
      dispatch(
        createAction(ActionType.SET_IS_DISCONNECT_TRIGGER, disconnectPayload),
      );
    }
  };

  // to know whether bluetooth is on/off
  const handleBTState = (btState) => {
    const {state} = btState;
    switch (state) {
      case 'on':
        if (Platform.OS === 'ios') {
          setIsBluetoothOn(true);
        }
        break;
      case 'off':
        setIsBluetoothOn(false);
        stopAdvertising();
        break;
      default:
        break;
    }
  };

  let timer;
  const startTimer = () => {
    timer = setInterval(() => {
      if (secs > 0) {
        setSecs((s) => {
          if (s > 0) {
            return s - 1;
          }
          const dsimissPayload = {
            isRecieveEnd: true,
          };
          dispatch(
            createAction(ActionType.UPDATE_IS_RECEIVE_END, dsimissPayload),
          );
          // btConnectionErrorModelAppear();
          const btConnectionErrorPayload = {
            isBTConnectionError: true,
          };
          dispatch(
            createAction(
              ActionType.SET_IS_BT_CONNECTION_ERROR,
              btConnectionErrorPayload,
            ),
          );
          return 80;
        });
      } else {
        const dsimissPayload = {
          isRecieveEnd: true,
        };
        dispatch(
          createAction(ActionType.UPDATE_IS_RECEIVE_END, dsimissPayload),
        );
        // lossConnectionModelAppear();
      }
    }, 1000);
  };

  const clearTimer = () => {
    clearInterval(timer);
  };

  const handleIncomingMessage = (incomingMessage) => {
    senderBluetoothDataString = senderBluetoothDataString + incomingMessage;
    if (toastRef != null) {
      if (toastRef.current) {
        toastRef.current.show('Receiving');
      }
    }
    console.log('incoming', incomingMessage);
    if (incomingMessage) {
      // to show cancel button
      // avoid loading blocking if BT connection error
      setHasSignal(true);
      setSecs(80);
      // const isBtHasSignalPayload = {
      //   isBTHasSignal: true,
      // };
      // dispatch(
      //   createAction(ActionType.SET_IS_BT_HAS_SIGNAL, isBtHasSignalPayload),
      // );
    }
    if (senderBluetoothDataString.includes('com.kerrylogistics.epod.staging')) {
      const dataType = checkDataType(senderBluetoothDataString);
      senderBluetoothDataString = ''; //reset senderBluetoothDataString
      const {type, data} = dataType;
      switch (type) {
        case Constant.DATA_TYPE.RECEICVER_DATA:
          const receivedDataModel = JSON.parse(data);
          receiverBluetoothName = receivedDataModel.receiverBluetoothName;
          const payload = {
            receiverBluetoothName: receiverBluetoothName,
            toManifest: receivedDataModel.toManifest,
            toUser: receivedDataModel.toUser,
            transferStartTime: receivedDataModel.transferStartTime,
            receiverData: receivedDataModel,
          };
          dispatch(createAction(ActionType.SET_SENDER_TRANSFER_DATA, payload));
          break;
        case Constant.DATA_TYPE.DEFAULT_DATA:
          handleDefaultDataType(data);
          break;
        case Constant.DATA_TYPE.JOB_CLICKED:
          handleSelectJob(data);
          break;
        case Constant.DATA_TYPE.CONFIRM_BTN_CLICK:
          // trigger to show confirm accept dialog
          handleConfirmJob();
          break;
        case Constant.DATA_TYPE.REJECTED_CONFRM_CLICK:
          handleRejectJob();
          break;
        case Constant.DATA_TYPE.ACCEPTED_CONFRM_CLICK:
          handleAcceptJob();
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    BluetoothSerial.isEnabled().then((isEnabled) => {
      if (isEnabled) {
        setIsBluetoothOn(true);
        BleManager.start({showAlert: false}).then(() => {});
        bleManagerEmitter.addListener(
          'BleManagerDiscoverPeripheral',
          handleDiscoverPeripheral,
        );
      } else {
        setIsBluetoothOn(false);
        dispatch(createAction(ActionType.TRANSFER_DATA_RESET));
      }
    });
    // if (Platform.OS === 'ios') {
    //   Peripheral.onStateChanged((state) => {
    //     console.log('snsss', state)
    //     // wait until Bluetooth is ready
    //       if (state === 'poweredOn') {
    //         console.log('skkwkkw')
    //         setIsBluetoothOn(true);
    //         BleManager.start({showAlert: false}).then(() => {});
    //         bleManagerEmitter.addListener(
    //           'BleManagerDiscoverPeripheral',
    //           handleDiscoverPeripheral,
    //         );
    //         // first, define a characteristic with a value
    //       } else {
    //         setIsBluetoothOn(false);
    //         dispatch(createAction(ActionType.TRANSFER_DATA_RESET));
    //       }
    //   });
    // } else {
    //   BluetoothSerial.isEnabled().then((isEnabled) => {
    //     console.log('is', isEnabled)
    //     if (isEnabled) {
    //       setIsBluetoothOn(true);
    //       BleManager.start({showAlert: false}).then(() => {});
    //       bleManagerEmitter.addListener(
    //         'BleManagerDiscoverPeripheral',
    //         handleDiscoverPeripheral,
    //       );
    //     } else {
    //       setIsBluetoothOn(false);
    //       dispatch(createAction(ActionType.TRANSFER_DATA_RESET));
    //     }
    //   });
    // }

    bleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      connectToPeripheral,
    );

    bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleBTStatusDisconnect,
    );

    bleManagerEmitter.addListener('BleManagerDidUpdateState', handleBTState);

    if (Platform.OS === 'android') {
      blePeripheralEmitter.addListener('onCharacteristicWriteRequest', (v) => {
        switch (v.characteristic.toLowerCase()) {
          case Constant.RECEIVER_BLUETOOTH_NAME_CHARACTERISTIC:
            const decodedValue = Utf8ArrayToStr(v.data);
            handleIncomingMessage(decodedValue);
            break;
        }
      });
    }
    return () => {
      bleManagerEmitter.removeListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      );
      bleManagerEmitter.removeListener(
        'BleManagerConnectPeripheral',
        connectToPeripheral,
      );
      bleManagerEmitter.removeListener(
        'BleManagerDisconnectPeripheral',
        handleBTStatusDisconnect,
      );
      bleManagerEmitter.removeListener(
        'BleManagerDidUpdateState',
        handleBTState,
      );
    };
  }, []);

  const writeData = (data, type) => {
    setSecs(80);
    return `${JSON.stringify(data)}|${type}|com.kerrylogistics.epod.staging`;
  };

  const checkDataType = (value) => {
    const index = value.indexOf('com.kerrylogistics.epod.staging');
    const dataWithType = value.substring(0, index);
    const type = dataWithType.substring(
      dataWithType.length - 1 - Constant.DATA_TYPE.DEFAULT_DATA.length,
      dataWithType.length - 1,
    );
    const data = dataWithType.substring(
      0,
      dataWithType.length - 1 - Constant.DATA_TYPE.DEFAULT_DATA.length - 1,
    );
    return {
      data,
      type,
    };
  };

  const handleDefaultDataType = (input) => {
    try {
      const receivedDataModel = JSON.parse(input);
      const restructuredJobList = receivedDataModel.jobs.map((j) => {
        if (j._id) {
          return {
            ...j,
            id: j._id,
            isSelected: false,
          };
        }
        return {
          ...j,
          isSelected: false,
        };
      });
      const tranferDataPayload = {
        jobs: restructuredJobList,
        orders: receivedDataModel.orders,
        orderItems: receivedDataModel.orderItems,
        customers: receivedDataModel.customers,
        fromManifest: receivedDataModel.fromManifest,
        fromUser: receivedDataModel.fromUser,
        transferStartTime: receivedDataModel.transferStartTime,
        reasonDescription: receivedDataModel.reasonDescription,
        transferId: receivedDataModel.transferId,
        reason: receivedDataModel.reason,
        customerStep: receivedDataModel.customerStep,
      };
      const payload = {
        isRecieveEnd: true,
      };
      const selectedJobPayload = {
        selectedJobs: [],
      };
      dispatch(
        createAction(ActionType.UPDATE_SELECTED_JOBS_DATA, selectedJobPayload),
      );
      dispatch(
        createAction(ActionType.SET_RECEIVER_TRANSFER_DATA, tranferDataPayload),
      );
      dispatch(createAction(ActionType.UPDATE_IS_RECEIVE_END, payload));
    } catch (e) {
      console.log('e', e);
    }
  };

  const handleSelectJob = (input) => {
    const selectedJob = JSON.parse(input);
    const selectedJobId = selectedJob.job._id
      ? selectedJob.job._id
      : selectedJob.job.id;
    if (selectedJob.isSelected) {
      const payload = {
        receivedSelectedJobId: selectedJobId,
      };
      dispatch(
        createAction(ActionType.UPDATE_RECEIVE_SELECTED_JOB_ID, payload),
      );
    } else {
      const payload = {
        receivedCancelSelectedJobId: selectedJobId,
      };
      dispatch(
        createAction(ActionType.UPDATE_RECEIVE_CANCEL_SELECTED_JOB_ID, payload),
      );
    }
  };

  const handleDeselectJob = (input) => {
    const selectedJob = JSON.parse(input);
    const payload = {
      receivedCancelSelectedJobId: selectedJob._id
        ? selectedJob._id
        : selectedJob.id,
    };
    dispatch(
      createAction(ActionType.UPDATE_RECEIVE_CANCEL_SELECTED_JOB_ID, payload),
    );
  };

  const handleConfirmJob = () => {
    const payload = {
      isConfirmJobTransfer: true,
    };
    dispatch(createAction(ActionType.SET_IS_CONFRIM_JOB_TRANSFER, payload));
  };

  const handleRejectJob = () => {
    const payload = {
      isCancelJobTransfer: true,
    };
    dispatch(createAction(ActionType.SET_IS_CANCEL_JOB_TRANSFER, payload));
    const showLoadingPayload = {
      isRecieveEnd: true,
    };
    dispatch(
      createAction(ActionType.UPDATE_IS_RECEIVE_END, showLoadingPayload),
    );
  };

  const handleAcceptJob = () => {
    if (!jobTransferModel.isDoneTransfer) {
      const payload = {
        isDoneTransfer: true,
      };
      dispatch(createAction(ActionType.SET_IS_DONE_TRANSFER, payload));
      const showLoadingPayload = {
        isRecieveEnd: false,
      };
      dispatch(
        createAction(ActionType.UPDATE_IS_RECEIVE_END, showLoadingPayload),
      );
      const confirmJobTransferPayload = {
        isConfirmJobTransfer: false,
      };
      dispatch(
        createAction(
          ActionType.SET_IS_CONFRIM_JOB_TRANSFER,
          confirmJobTransferPayload,
        ),
      );
    }
  };

  const resetHasBtSignal = () => {
    const isBtHasSignalPayload = {
      isBTHasSignal: false,
    };
    dispatch(
      createAction(ActionType.SET_IS_BT_HAS_SIGNAL, isBtHasSignalPayload),
    );
  };

  return {
    isBluetoothOn,
    writeData,
    startAdvertising,
    stopAdvertising,
    checkDataType,
    handleDefaultDataType,
    handleSelectJob,
    handleDeselectJob,
    handleConfirmJob,
    handleRejectJob,
    handleAcceptJob,
    resetHasBtSignal,
    startTimer,
    clearTimer,
    setToastRef,
  };
};
