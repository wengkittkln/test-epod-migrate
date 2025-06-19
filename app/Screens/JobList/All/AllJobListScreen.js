import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  TextInput,
  FlatList,
} from 'react-native';
import * as Constants from '../../../CommonConfig/Constants';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import JobItem from '../../../Components/JobItem/JobItem';
import {useAllJobList} from '../../../Hooks/JobList/All/useAllJobList';
import EmptyJobListView from '../../../Components/EmptyJobListView';
import CustomAlertView from '../../../Components/CustomAlertView';
import {translationString} from '../../../Assets/translation/Translation';
import {AppContext} from '../../../Context/AppContext';
import SortButton from '../../../Components/SortButton';
import * as JobSortRealmManager from '../../../Database/realmManager/JobSortRealmManager';
import {IndexContext} from '../../../Context/IndexContext';

export default ({route, navigation}) => {
  const {signalRConnection} = React.useContext(AppContext);
  const {epodRealm} = React.useContext(IndexContext);
  const {
    authState,
    manifestData,
    masterData,
    datalist,
    joblistModel,
    setNormalSortOption,
    normalSortOption,
    setVipSortOption,
    vipSortOption,
  } = useAllJobList(route, navigation);


  const sortOptions = [
    {label: translationString.shopCode, value: 'shopCode'},
    {label: translationString.consignee, value: 'consignee'},
    {label: translationString.destination, value: 'destination'},
    {
      label: translationString.requestArrivalTimeFrom,
      value: 'requestArrivalTimeFrom',
    },
    {
      label: translationString.requestArrivalTimeTo,
      value: 'requestArrivalTimeTo',
    },
    {label: translationString.totalQuantity, value: 'totalQuantity'},
    {label: translationString.totalCbm, value: 'totalCbm'},
  ];

  return (
    <SafeAreaView style={styles.baseContainer}>
      <View style={styles.listContainer}>
        {datalist.length !== 0 && vipSortOption !== '' && (
          <View style={styles.sortContainer}>
            <Text style={styles.sortText}>
              {translationString.vipJob} {translationString.sort}:{' '}
              {sortOptions.find((s) => s.value == vipSortOption.type).label}(
              {vipSortOption.order === 'asc'
                ? translationString.ascending
                : translationString.descending}
              )
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setVipSortOption('');
                JobSortRealmManager.resetJobSortOption(epodRealm, true);
              }}>
              <Text style={styles.resetButtonText}>
                {translationString.reset}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {datalist.length !== 0 && normalSortOption !== '' && (
          <View style={styles.sortContainer}>
            <Text style={styles.sortText}>
              {translationString.normalJob} {translationString.sort}:{' '}
              {sortOptions.find((s) => s.value == normalSortOption.type).label}(
              {normalSortOption.order === 'asc'
                ? translationString.ascending
                : translationString.descending}
              )
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setNormalSortOption('');
                JobSortRealmManager.resetJobSortOption(epodRealm, false);
              }}>
              <Text style={styles.resetButtonText}>
                {translationString.reset}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          contentContainerStyle={datalist.length === 0 && styles.centerEmptySet}
          style={styles.flatlist}
          data={datalist}
          renderItem={({item}) => <JobItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <EmptyJobListView
              message={
                authState.isNoOrder ||
                (joblistModel.pendingJobNum === 0 &&
                  joblistModel.completedJobNum === 0 &&
                  joblistModel.failedJobNum === 0)
                  ? translationString.empty_job_placeholder_text
                  : joblistModel.pendingJobNum === 0 &&
                    joblistModel.completedJobNum + joblistModel.failedJobNum ===
                      joblistModel.totalJobNum
                  ? translationString.shipping_placeholder_text
                  : translationString.incomplete_job_placeholder_text
              }
            />
          )}
          ListFooterComponent={<View style={{height: 70}} />}
        />
        {datalist.length !== 0 && (
          <SortButton
            setNormalSortSelect={setNormalSortOption}
            setVIPSortSelect={setVipSortOption}
            sortOptions={sortOptions}
          />
        )}
      </View>
      {joblistModel.filterSuccessMsg !== '' && (
        <CustomAlertView alertMsg={joblistModel.filterSuccessMsg} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'rgb(248, 248, 248)',
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  flatlist: {
    flex: 1,
  },
  centerEmptySet: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  sortText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  resetButton: {
    marginLeft: 8,
  },
  resetButtonText: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
