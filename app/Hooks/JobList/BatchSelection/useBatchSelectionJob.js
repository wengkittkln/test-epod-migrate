/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import * as Constants from '../../../CommonConfig/Constants';
import {translationString} from '../../../Assets/translation/Translation';
import {IndexContext} from '../../../Context/IndexContext';
import BackButton from '../../../Assets/image/icon_back_white.png';
import {
  TouchableOpacity,
  Image,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import SearchIcon from '../../../Assets/image/icon_search.png';
import ScanIcon from '../../../Assets/image/icon_scanqrcode.png';

export const useBatchSelectionJob = (route, navigation) => {
  let batchJob = route.params.batchJob;

  const job = route.params.job;
  const stepCode = route.params.stepCode;
  // use to define photo taking flow else it is normal flow
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const [datalist, setDataList] = useState([]);
  const [backupDatalist, setBackupDataList] = useState([]);

  const getPendingJobList = () => {
    setDataList(batchJob);
    setBackupDataList(batchJob);
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

  const onClick = (job) => {
    const _datalist = datalist;
    _datalist.find((x) => x.id === job.id).isSelected = true;

    setDataList([..._datalist]);
  };

  const onRemove = (job) => {
    const _datalist = datalist;
    _datalist.find((x) => x.id === job.id).isSelected = false;

    setDataList([..._datalist]);
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
  }, [route.params.batchJob]);

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
      headerRight: () => (
        <View style={styles.optionMenu}>
          <Pressable
            style={styles.menuIcon}
            onPress={() => {
              console.log('search');
              navigation.navigate('BatchSelectionSearch', {
                job: job,
                batchJob: batchJob,
                stepCode: stepCode,
              });
              console.log('search2');
            }}>
            <Image source={SearchIcon} />
          </Pressable>
          <Pressable
            style={styles.menuIcon}
            onPress={() => {
              console.log('scan');
              navigation.navigate('BatchSelectionJobScanQR', {
                job: job,
                batchJob: batchJob,
                stepCode: stepCode,
              });
            }}>
            <Image source={ScanIcon} />
          </Pressable>
        </View>
      ),
      headerTitle: translationString.batchSelection,
    });
  }, [navigation, backupDatalist]);

  return {
    onConfirm,
    onClick,
    getSelectedCount,
    onRemove,
    datalist,
    jobId: job.id,
  };
};

const styles = StyleSheet.create({
  optionMenu: {
    flexDirection: 'row',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  menuIcon: {
    padding: 10,
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
  loading: {
    backgroundColor: '#FFFFFF4D',
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
  },
});
