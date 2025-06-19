/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import * as Constants from '../../../CommonConfig/Constants';
import {translationString} from '../../../Assets/translation/Translation';
import BackButton from '../../../Assets/image/icon_back_white.png';
import SearchIcon from '../../../Assets/image/icon_search.png';
import {
  TouchableOpacity,
  Image,
  View,
  TextInput,
  StyleSheet,
} from 'react-native';

export const useBatchSelectionJobSearch = (route, navigation) => {
  let batchJob = route.params.batchJob;
  const job = route.params.job;
  const stepCode = route.params.stepCode;
  // use to define photo taking flow else it is normal flow
  const [datalist, setDataList] = useState([]);
  const [backupDatalist, setBackupDataList] = useState([]);
  const [searchDatalist, setSearchDataList] = useState([]);
  const [searchText, setSearchText] = useState('');
  let timer;

  const getPendingJobList = (searchText) => {
    if (!searchText) {
      setDataList(JSON.parse(JSON.stringify(batchJob)));
      setBackupDataList(JSON.parse(JSON.stringify(batchJob)));
      setSearchDataList(JSON.parse(JSON.stringify(batchJob)));
    } else {
      const searchResult = datalist.filter(
        (x) =>
          x.orderList?.indexOf(searchText) > 0 ||
          x.trackingList?.indexOf(searchText) > 0,
      );
      setSearchDataList([...searchResult]);
    }
  };

  const onConfirm = () => {
    if (stepCode === Constants.StepCode.PRE_CALL) {
      navigation.navigate({
        name: 'BatchSelection',
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
        name: 'BatchSelection',
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
    const selectedJobCount = datalist.filter(
      (x) => x.isSelected === true,
    ).length;

    return translationString.formatString(
      translationString.confirm_job_receive,
      `(${selectedJobCount})`,
    );
  };

  useEffect(() => {
    getPendingJobList(null);
  }, []);

  useEffect(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      getPendingJobList(searchText);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchText]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerBar}>
          <Image style={styles.searchIconTint} source={SearchIcon} />
          <TextInput
            style={styles.searchInput}
            onChangeText={(text) => setSearchText(text)}
            placeholder={translationString.search}
            autoCapitalize={'none'}
          />
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            onBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight: () => null,
    });
  }, [navigation, backupDatalist, searchText]);

  return {
    onConfirm,
    onClick,
    getSelectedCount,
    onRemove,
    datalist: searchDatalist,
    jobId: job.id,
  };
};

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    marginLeft: 16,
    color: 'white',
    fontSize: Constants.textInputFonSize,
    fontFamily: Constants.fontFamily,
  },
  searchIconTint: {
    tintColor: 'white',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
