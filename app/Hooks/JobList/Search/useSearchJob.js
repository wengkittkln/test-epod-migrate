/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  TextInput,
  Dimensions,
} from 'react-native';
import {useDispatch} from 'react-redux';
import * as Constants from '../../../CommonConfig/Constants';
import * as JobRealmManager from '../../../Database/realmManager/JobRealmManager';
import * as GeneralHelper from '../../../Helper/GeneralHelper';
import * as JobHelper from '../../../Helper/JobHelper';
import {translationString} from '../../../Assets/translation/Translation';
import {IndexContext} from '../../../Context/IndexContext';
import SeachIcon from '../../../Assets/image/icon_search.png';
import BackButton from '../../../Assets/image/icon_back_white.png';
import CloseButton from '../../../Assets/image/close_grey.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const useSearchJob = (navigation) => {
  const dispatch = useDispatch();
  const {auth, manifestData, masterData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);
  const [searchText, setSearchText] = useState('');
  const [datalist, setDataList] = useState([]);

  const searchAllJob = () => {
    let localJobList = [];
    let tempDataList = [];

    localJobList =
      JobRealmManager.getAllJobByRequestArrivalTimeFromAsc(epodRealm);

    localJobList.map((item) => {
      let jobModel = GeneralHelper.convertRealmObjectToJSON(item);
      tempDataList.push(jobModel);
    });

    const sortedList = JobHelper.sortingForAllJobAndSearchJob(tempDataList);
    setDataList(sortedList);
  };

  const searchJob = () => {
    let localJobList = [];
    let tempDataList = [];

    localJobList = JobRealmManager.searchJobByTrackingAndOrderNo(
      epodRealm,
      searchText,
    );

    localJobList.map((item) => {
      let jobModel = GeneralHelper.convertRealmObjectToJSON(item);
      tempDataList.push(jobModel);
    });
    const sortedList = JobHelper.sortingForAllJobAndSearchJob(tempDataList);
    setDataList(sortedList);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight:
        searchText.length === 0
          ? null
          : () => (
              <TouchableOpacity
                style={Constants.navStyles.navButton}
                onPress={() => {
                  setSearchText('');
                }}>
                <Image style={{tintColor: 'white'}} source={CloseButton} />
              </TouchableOpacity>
            ),
      headerTitle: () => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image style={{tintColor: 'white'}} source={SeachIcon} />
          <TextInput
            style={{
              width: '70%',
              marginLeft: 16,
              color: 'white',
              fontSize: Constants.textInputFonSize,
              fontFamily: Constants.fontFamily,
            }}
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
            placeholder={translationString.search}
            autoCapitalize={'none'}
          />
        </View>
      ),
    });
  }, [navigation, searchText]);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    } else {
      if (searchText.length > 0) {
        searchJob();
      } else {
        searchAllJob();
      }
    }
  }, [EpodRealmHelper, epodRealm, searchText]);

  return {
    searchText,
    datalist,
  };
};
