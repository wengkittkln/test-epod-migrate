import React, {useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  TextInput,
  Platform,
  FlatList,
} from 'react-native';
import * as Constants from '../../../CommonConfig/Constants';
import * as CustomerStepRealmManager from '../../../Database/realmManager/CustomerStepRealmManager';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import JobItem from '../../../Components/JobItem/JobItem';

import {useSearchJob} from '../../../Hooks/JobList/Search/useSearchJob';

export default ({route, navigation}) => {
  const {searchText, datalist} = useSearchJob(navigation);

  return (
    <SafeAreaView style={styles.baseContainer}>
      <FlatList
        contentContainerStyle={datalist.length === 0 && styles.centerEmptySet}
        style={styles.flatlist}
        data={datalist}
        renderItem={({item}) => <JobItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'rgb(248, 248, 248)',
  },
  flatlist: {
    flex: 1,
  },
  centerEmptySet: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});
