import React, {useState, useEffect} from 'react';
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
import {useCompletedJobList} from '../../../Hooks/JobList/Completed/useCompletedJobList';
import EmptyJobListView from '../../../Components/EmptyJobListView';
import CustomAlertView from '../../../Components/CustomAlertView';
import {translationString} from '../../../Assets/translation/Translation';
import LoadingModal from '../../../Components/LoadingModal';
import * as ActionRealmManager from '../../../Database/realmManager/ActionRealmManager';
import * as JobSortRealmManager from '../../../Database/realmManager/JobSortRealmManager';
import {IndexContext} from '../../../Context/IndexContext';
import {useMasterData} from '../../../Hooks/MasterData/useMasterData';
import {useDeltaSync} from '../../../Hooks/DeltaSync/useDeltaSync';
import {useActionSync} from '../../../Hooks/ActionSync/useActionSync';
import {useNetwork} from '../../../Hooks/Network/useNetwork';
import {AppContext} from '../../../Context/AppContext';
import SortButton from '../../../Components/SortButton';

export default ({route, navigation}) => {
  const {epodRealm} = React.useContext(IndexContext);
  const {networkModel} = useNetwork();
  const {signalRConnection} = React.useContext(AppContext);

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
  } = useCompletedJobList(route, navigation);

  const {callGetMasterDataApi} = useMasterData();
  const {isDeltaSyncLoading, callGetDeltaSyncApi} = useDeltaSync(
    callGetMasterDataApi,
    'CompletedJobListScreen',
  );
  const {
    getAllPendingAction,
    callActionSyncApi,
    syncPhotos,
    updateActionsSyncLockToPending,
  } = useActionSync();

  const [isLoading, setLoading] = useState(false);

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

  const handleRefresh = async () => {
    setLoading(true);
    await handleDeltaSync();
    setLoading(false);
  };

  const handleDeltaSync = async () => {
    if (!networkModel.isConnected) {
      return;
    }

    console.log(
      `[DeltaSync] CompletedJobListScreen initiated. Timestamp: ${new Date().toISOString()}.`,
    );

    try {
      const pendingActionPhotoList =
        await ActionRealmManager.getPendingActionsAndPhotosCount(epodRealm);
      if (pendingActionPhotoList.length > 0) {
        updateActionsSyncLockToPending();
        var pendingList = await getAllPendingAction(true);
        await callActionSyncApi(pendingList);
        updateActionsSyncLockToPending();
      }
      await callGetMasterDataApi();
      await callGetDeltaSyncApi();
      console.log(
        `[Delta Sync] CompletedJobListScreen Ended. Timestamp: ${new Date().toISOString()}.`,
      );
    } catch (error) {
      console.log(error.message);
      console.log('DeltaSync got error');
    }
  };

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
          onRefresh={handleRefresh}
          refreshing={false}
          ListEmptyComponent={() => (
            <EmptyJobListView
              message={
                authState.isNoOrder ||
                (joblistModel.pendingJobNum === 0 &&
                  joblistModel.completedJobNum === 0 &&
                  joblistModel.failedJobNum === 0)
                  ? translationString.empty_job_placeholder_text
                  : translationString.done_placeholder_text
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

      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading2}
      />
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
