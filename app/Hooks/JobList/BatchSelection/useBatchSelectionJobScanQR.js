/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect, useRef} from 'react';
import * as Constants from '../../../CommonConfig/Constants';
import {translationString} from '../../../Assets/translation/Translation';
import {IndexContext} from '../../../Context/IndexContext';
import BackButton from '../../../Assets/image/icon_back_white.png';
import {TouchableOpacity, Image, Animated, Alert} from 'react-native';
import {ToastMessage} from '../../../Components/Toast/ToastMessage';

export const useBatchSelectionJobScanQR = (route, navigation) => {
  const batchJob = route.params.batchJob;
  const stepCode = route.params.stepCode;
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const [datalist, setDataList] = useState([]);
  const [backupDatalist, setBackupDataList] = useState([]);
  const [isSuccess, setSuccess] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getPendingJobList = () => {
    setDataList(batchJob);
    setBackupDataList(JSON.parse(JSON.stringify(batchJob)));
  };

  const animte = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 30,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addBarcode = (code) => {
    if (isLoading || isSuccess) {
      return;
    }
    animte();
    setLoading(true);
    setSuccess(true);

    const _dataList = datalist;
    const scanResult = _dataList.find(
      (x) =>
        x.orderList.indexOf(code) > -1 || x.trackingList.indexOf(code) > -1,
    );

    if (!scanResult) {
      Alert.alert(
        translationString.batchSelection,
        translationString.scan_job_not_found,
        [
          {
            text: translationString.okText,
            onPress: () => {
              setLoading(false);
            },
          },
        ],
        {cancelable: false},
      );
    } else if (scanResult && scanResult.isSelected) {
      const message = translationString.job_transfers.duplicate_scanned;
      ToastMessage({
        duration: 1000,
        text1: message,
      });
    } else {
      ToastMessage({
        duration: 1000,
        text1: translationString.scan_success,
      });
      scanResult.isSelected = true;
      setDataList([..._dataList]);
    }

    setTimeout(() => {
      setSuccess(false);
    }, 1000);
    setLoading(false);
  };

  const onConfirm = () => {
    if (stepCode === Constants.StepCode.PRE_CALL) {
      navigation.navigate({
        name: 'PreCallAction',
        params: {
          batchJob: datalist,
        },
        merge: true,
      });
    } else if (
      stepCode === Constants.StepCode.SIMPLE_POD ||
      stepCode === Constants.StepCode.BARCODE_POD
    ) {
      navigation.navigate({
        name: 'PodAction',
        params: {
          batchJob: datalist,
        },
        merge: true,
      });
    } else {
      alert('Current step is not support batch action');
    }
  };

  const onBack = () => {
    if (stepCode === Constants.StepCode.PRE_CALL) {
      navigation.navigate({
        name: 'PreCallAction',
        params: {
          batchJob: backupDatalist,
        },
        merge: true,
      });
    } else if (
      stepCode === Constants.StepCode.SIMPLE_POD ||
      stepCode === Constants.StepCode.BARCODE_POD
    ) {
      navigation.navigate({
        name: 'PodAction',
        params: {
          batchJob: backupDatalist,
        },
        merge: true,
      });
    } else {
      alert('Current step is not support batch action');
    }
  };

  const getSelectedCount = () => {
    const selectedJobCount = batchJob.filter(
      (x) => x.isSelected === true,
    ).length;

    return translationString.formatString(
      translationString.confirm_job_receive,
      `(${selectedJobCount})`,
    );
  };

  useEffect(() => {
    getPendingJobList();
  }, []);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            onBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight: null,
      headerTitle: translationString.batchSelection,
    });
  }, [navigation, backupDatalist]);

  return {
    isLoading,
    fadeAnim,
    onConfirm,
    getSelectedCount,
    addBarcode,
    onBack,
  };
};
