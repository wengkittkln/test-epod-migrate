import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import {
  TouchableOpacity,
  Image,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleManager from 'react-native-ble-manager';
import {useSelector, useDispatch} from 'react-redux';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import {toUTF8Array} from '../../../../Helper/QrCodeHelper';
import {createAction} from '../../../../Actions/CreateActions';
import * as Constants from '../../../../CommonConfig/Constants';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as ActionType from '../../../../Actions/ActionTypes';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const useScanTranckingNumber = (route, navigation) => {
  const jobTransferModel = useSelector((state) => state.JobTransferReducer);
  const cameraRef = useRef(null);
  const [isBarcodeScannerEnabled, setBarcodeScannerEnabled] = useState(true);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);

  const dispatch = useDispatch();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleQrCode = async (qrCode) => {
    if (isBarcodeScannerEnabled) {
      setBarcodeScannerEnabled(false);
      searchJob(qrCode);
    }
  };

  const searchJob = (trackingNumber) => {
    let tempJobList = jobTransferModel.jobs;
    let tempSelectedJoblist = jobTransferModel.selectedJobs;
    const index = tempJobList.findIndex((job) => {
      const trackNumberModel = JobHelper.getTrackingNumberOrCount(job);
      return trackNumberModel.trackingNum === trackingNumber;
    });
    const isExist = tempSelectedJoblist.some(function (item) {
      const trackNumberModel = JobHelper.getTrackingNumberOrCount(item);
      return trackNumberModel.trackingNum === trackingNumber;
    });
    if (index === -1) {
      GeneralHelper.showCustomTitleAlertMessage(
        'KOOLPoD',
        translationString.scan_job_not_found,
        () => {
          setBarcodeScannerEnabled(true);
        },
      );
      return;
    }
    if (isExist) {
      GeneralHelper.showCustomTitleAlertMessage(
        'KOOLPoD',
        translationString.scan_job_dup_slected,
        () => {
          setBarcodeScannerEnabled(true);
        },
      );
      return;
    }
    if (index > -1 && !isExist) {
      const selectedJob = tempJobList[index];
      selectedJob.isSelected = true;
      tempSelectedJoblist.push(selectedJob);
      tempJobList = [
        ...tempJobList.slice(0, index),
        selectedJob,
        ...tempJobList.slice(index + 1),
      ];
      const payload = {
        jobs: tempJobList,
      };
      const selectedPayload = {
        selectedJobs: tempSelectedJoblist,
      };
      const transferDataModel = {
        isSelected: true,
        job: selectedJob,
      };
      const outputMessage = '';
      // const outputMessage = writeData(
      //   transferDataModel,
      //   Constants.DATA_TYPE.JOB_CLICKED,
      // );
      BleManager.writeWithoutResponse(
        jobTransferModel.device.id,
        Constants.BASE_UUID,
        Constants.RECEIVER_BLUETOOTH_NAME_CHARACTERISTIC,
        toUTF8Array(outputMessage),
        Constants.maxByteSize,
      )
        .then(() => {
          dispatch(createAction(ActionType.UPDATE_JOBS_DATA, payload));
          dispatch(
            createAction(ActionType.UPDATE_SELECTED_JOBS_DATA, selectedPayload),
          );
          GeneralHelper.showCustomTitleAlertMessage(
            'KOOLPoD',
            translationString.formatString(
              translationString.scan_selected_job,
              tempSelectedJoblist.length,
            ),
            () => {
              setBarcodeScannerEnabled(true);
            },
          );
        })
        .catch((error) => {
          console.log('Write selected job error: ', error);
        });
    }
  };

  const confirmButtonOnPressed = () => {
    handleBack();
  };

  return {
    cameraRef,
    jobTransferModel,
    isBarcodeScannerEnabled,
    isShowLoadingIndicator,
    handleBack,
    handleQrCode,
    confirmButtonOnPressed,
  };
};
