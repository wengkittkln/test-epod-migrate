import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import JobItem from '../../../Components/JobItem/JobItem';
import {usePendingJobList} from '../../../Hooks/JobList/Pending/usePendingJobList';
import EmptyJobListView from '../../../Components/EmptyJobListView';
import FilterTypeModal from '../../../Components/FilterTypeModal';
import CustomAlertView from '../../../Components/CustomAlertView';
import LoginModal from '../../../Components/LoginModal/LoginModal';
import {translationString} from '../../../Assets/translation/Translation';
import {useActionSync} from '../../../Hooks/ActionSync/useActionSync';
import LoadingModal from '../../../Components/LoadingModal';
import * as ActionRealmManager from '../../../Database/realmManager/ActionRealmManager';
import * as JobRealmManager from '../../../Database/realmManager/JobRealmManager';
import * as JobSortRealmManager from '../../../Database/realmManager/JobSortRealmManager';
import {IndexContext} from '../../../Context/IndexContext';
import {AppContext} from '../../../Context/AppContext';
import {useMasterData} from '../../../Hooks/MasterData/useMasterData';
import {useDeltaSync} from '../../../Hooks/DeltaSync/useDeltaSync';
import {updateJobLatestETA} from '../../../ApiController/ApiController';
import {useNetwork} from '../../../Hooks/Network/useNetwork';
import {ActionType} from '../../../CommonConfig/Constants';
import SortButton from '../../../Components/SortButton';
import {useUnreadChatCount} from '../../../Hooks/Chat/useUnreadChatCount';

export default ({route, navigation}) => {
  const {epodRealm, manifestData} = React.useContext(IndexContext);
  const {signalRConnection, setFetchUnreadCountsCallback} =
    React.useContext(AppContext);
  const {networkModel} = useNetwork();

  const isSyncingRef = useRef(false);
  const {
    authState,
    joblistModel,
    loginModalModel,
    datalist,
    getPendingJobList,
    checkIsManifestDriverChange,
    userModel,
    setNormalSortOption,
    normalSortOption,
    setVipSortOption,
    vipSortOption,
  } = usePendingJobList(route, navigation);
  const {callGetMasterDataApi} = useMasterData();
  const {isDeltaSyncLoading, callGetDeltaSyncApi} = useDeltaSync(
    callGetMasterDataApi,
    'PendingJobListScreen',
  );
  const {
    getAllPendingAction,
    callActionSyncApi,
    updateActionsSyncLockToPending,
  } = useActionSync();

  // Use the unread chat count hook
  const {fetchUnreadCounts, getUnreadCount, markAsRead} = useUnreadChatCount();
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

  // Effect to fetch unread counts when datalist changes
  useEffect(() => {
    if (datalist && datalist.length > 0) {
      const jobIds = datalist.map((job) => job.id);
      fetchUnreadCounts(jobIds);
    }
  }, [datalist, fetchUnreadCounts]);

  // Effect for SignalR connection
  useEffect(() => {
    if (signalRConnection) {
      // SignalR connection is already established by AppProvider
      console.log('SignalR connection is available');

      // Register fetchUnreadCounts with AppContext
      setFetchUnreadCountsCallback(fetchUnreadCounts);
    }

    // Cleanup when component unmounts
    return () => {
      setFetchUnreadCountsCallback(null);
    };
  }, [signalRConnection, fetchUnreadCounts, setFetchUnreadCountsCallback]);

  // Handle chat button press - mark messages as read
  const handleChatPressed = useCallback(
    (jobId) => {
      markAsRead(jobId);
    },
    [markAsRead],
  );

  const handleRefresh = async () => {
    setLoading(true);
    await handleDeltaSync();
    setLoading(false);
  };

  const handleUpdateJobLatestETA = async () => {
    const isUpdated = await JobRealmManager.updateAllJobLatestETA(epodRealm);

    if (!isUpdated) {
      return;
    }

    const jobList = JobRealmManager.queryAllJobsData(epodRealm);
    const toUpdateJobList = [...jobList]
      .filter((j) => j.latestETA)
      .map((j) => ({
        jobId: j.id,
        latestETA: new Date(j.latestETA),
      }));

    if (networkModel.isConnected) {
      await updateJobLatestETA(toUpdateJobList);
      getPendingJobList();
    }
  };

  const handleDeltaSync = async () => {
    // Prevent multiple concurrent syncs
    if (isSyncingRef.current) {
      console.log(
        '[DeltaSync] Sync already in progress, skipping new sync request',
      );
      return;
    }

    if (!networkModel.isConnected) {
      console.log('[DeltaSync] No network connection, skipping sync');
      return;
    }

    // Set sync in progress
    isSyncingRef.current = true;
    console.log(
      `[DeltaSync] PendingJobListScreen initiated. Timestamp: ${new Date().toISOString()}.`,
    );

    try {
      updateActionsSyncLockToPending();
      var pendingList = await getAllPendingAction(true);

      if (pendingList.length > 0) {
        console.log(
          `[DeltaSync] Pending Action List Available (${pendingList.length} items), calling Action Sync API`,
        );
        await callActionSyncApi(pendingList);
        if (containsPODActionType(pendingList)) {
          await handleUpdateJobLatestETA();
        }
      }
      updateActionsSyncLockToPending();

      await callGetMasterDataApi();
      await callGetDeltaSyncApi();

      console.log(
        `[DeltaSync] PendingJobListScreen Ended. Timestamp: ${new Date().toISOString()}.`,
      );
    } catch (error) {
      console.error('[DeltaSync] Error during sync:', error.message);
    } finally {
      // Always reset the sync state, even if there was an error
      isSyncingRef.current = false;
    }
  };

  const containsPODActionType = (items) => {
    const validActionTypes = [
      ActionType.BARCODEESIGN_POD,
      ActionType.ESIGNBARCODE_POD,
      ActionType.BARCODE_POD,
      ActionType.ESIGNATURE_POD,
      ActionType.SKU_POD,
      ActionType.POD_SUCCESS,
    ];
    return items.some((item) => validActionTypes.includes(item.actionType));
  };

  // Handle network reconnection
  useEffect(() => {
    if (networkModel.isConnected) {
      console.log('Network connected, triggering delta sync');
      const timer = setTimeout(() => {
        handleDeltaSync();
      }, 1000); // Small delay to ensure network is stable
      return () => clearTimeout(timer);
    }
  }, [networkModel.isConnected]);

  // Handle screen focus
  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      setTimeout(() => {
        console.log('Pending Job List Screen Focus Upload');
        handleDeltaSync();
      }, 1000);
    });
    return () => {
      focusListener();
    };
  });

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
          renderItem={({item}) => (
            <JobItem
              item={{
                ...item,
                unreadCount: getUnreadCount(item.id),
                onChatPressed: handleChatPressed,
              }}
            />
          )}
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
      <FilterTypeModal />
      <LoadingModal
        isShowLoginModal={isLoading || isDeltaSyncLoading}
        message={translationString.loading2}
      />
      <LoginModal isShowLoginModal={loginModalModel.isShowLoginModal} />
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
