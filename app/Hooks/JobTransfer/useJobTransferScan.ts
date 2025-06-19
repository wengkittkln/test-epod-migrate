import {StackNavigationProp} from '@react-navigation/stack';
import {useEffect, useRef, useState} from 'react';
import {JobTransferParamsList} from '../../NavigationStacks/JobTransferStack';
import {useJobTransferProvider} from '../../Provider/JobTransferProvider';
import {IndexContext} from '../../Context/IndexContext';
import React from 'react';
import {useFocusEffect} from '@react-navigation/native';
import * as JobRealmManager from '../../Database/realmManager/JobRealmManager';
import {
  ToastMessage,
  ToastMessageError,
} from '../../Components/Toast/ToastMessage';
import {translationString} from '../../Assets/translation/Translation';
import {useDispatch, useSelector} from 'react-redux';
import store from '../../Reducers';
import {createAction} from './../../Actions/CreateActions';
import * as ActionType from './../../Actions/ActionTypes';

export const useJobTransferScan = (
  navigation: StackNavigationProp<JobTransferParamsList, 'JobTransferScan'>,
) => {
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const cameraRef = useRef(null);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [isBarcodeScannerEnabled, setIsBarcodeScannerEnabled] = useState(false);
  const jobTransferProvider = useJobTransferProvider();
  const [isScanned, setIsScanned] = useState(false);
  const dispatch = useDispatch();

  const selectedJobListReducer = useSelector<typeof store>(
    (state) => state.JobTransferReducerV2,
  ) as any;

  const handleQrCodeScanned = (qrCode: string) => {
    if (isBarcodeScannerEnabled && qrCode.length > 0) {
      setIsBarcodeScannerEnabled(false);
      setIsShowLoadingIndicator(true);
      const mode = qrCode.split('|')[0]; //JT
      if (mode !== 'JT') {
        const compressString = jobTransferProvider.compressString ?? '';

        var job = JobRealmManager.searchJobByTrackingAndOrderNo(
          epodRealm,
          qrCode,
        );
        if (job != null && job != undefined && job.length > 0) {
          const data = job[0].id + ',' + job[0].trackingList + '|';
          if (
            !selectedJobListReducer.selected.includes(job[0].id) &&
            !jobTransferProvider.selectedJobList.find((x) => x.id == job[0].id)
          ) {
            setIsScanned(true);

            jobTransferProvider.setCompressString(compressString + data);

            ToastMessage({
              text1: translationString.formatString(
                translationString.job_transfers.scanned_job,
                qrCode,
              ) as string,
            });
            const jobNumPayload = {
              selected: selectedJobListReducer.selected + data,
            };
            dispatch(
              createAction(
                ActionType.SET_JOB_TRANSFER_SELECTED_ITEMS,
                jobNumPayload,
              ),
            );
          } else {
            // ToastMessage(translationString.job_transfers.duplicate_scanned);
          }
        } else {
          ToastMessage({
            text1: translationString.job_transfers.invalid_qr_code,
          });
        }
        setIsBarcodeScannerEnabled(true);
        setIsShowLoadingIndicator(false);
      }
    }
  };

  const comfirmSelect = () => {
    navigation.pop();
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsBarcodeScannerEnabled(true);
    }, []),
  );

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [epodRealm]);

  return {
    cameraRef,
    isShowLoadingIndicator,
    isScanned,
    handleQrCodeScanned,
    comfirmSelect,
  };
};
