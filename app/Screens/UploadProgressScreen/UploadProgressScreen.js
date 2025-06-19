import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ApiController from '../../ApiController/ApiController';
import BackButton from '../../Assets/image/icon_back_white.png';
import * as Constants from '../../CommonConfig/Constants';
import {IndexContext} from '../../Context/IndexContext';
import * as ActionRealmManager from '../../Database/realmManager/ActionRealmManager';
import * as PhotoRealmManager from '../../Database/realmManager/PhotoRealmManager';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as PhotoHelper from '../../Helper/PhotoHelper';
import {useActionSync} from '../../Hooks/ActionSync/useActionSync';
import {useRefreshTokenLogin} from '../../Hooks/RefreshTokenLogin/useRefreshTokenLogin';
import {translationString} from '../../Assets/translation/Translation';

const getSyncStatusText = (status) => {
  switch (status) {
    case Constants.SyncStatus.SYNC_PENDING:
      return translationString.upload_status_pending;
    case Constants.SyncStatus.SYNC_LOCK:
      return translationString.upload_status_syncing;
    case Constants.SyncStatus.SYNC_SUCCESS:
      return translationString.upload_status_synced;
    case Constants.SyncStatus.SYNC_FAILED:
      return translationString.upload_status_failed;
    case Constants.SyncStatus.SYNC_PARTIAL_SUCCESS:
      return translationString.upload_status_partial;
    case Constants.SyncStatus.PENDING_SELECT_PHOTO:
      return translationString.upload_status_photo_pending;
    default:
      return `Unknown (${status})`; // Or translationString.status_unknown_with_param.replace('{status}', status)
  }
};

const getActionTypeText = (type) => {
  switch (type) {
    case Constants.ActionType.TAKE_PHOTO:
      return translationString.action_type_take_photo;
    case Constants.ActionType.GENERAL_CALL_START:
      return translationString.action_type_general_start;
    case Constants.ActionType.GENERAL_CALL_SUCCESS:
      return translationString.action_type_general_success;
    case Constants.ActionType.GENERAL_CALL_FAIL:
      return translationString.action_type_general_fail;
    case Constants.ActionType.PRE_CALL_SUCCESS:
      return translationString.action_type_precall_success;
    case Constants.ActionType.PRE_CALL_FAIL:
      return translationString.action_type_precall_fail;
    case Constants.ActionType.PRE_CALL_SKIP:
      return translationString.action_type_precall_skip;
    case Constants.ActionType.POD_SUCCESS:
      return translationString.action_type_pod_success;
    case Constants.ActionType.POD_FAIL:
      return translationString.action_type_pod_fail;
    case Constants.ActionType.PARTIAL_DLEIVER_FAIL:
      return translationString.action_type_partial_fail;
    case Constants.ActionType.ESIGNATURE_POD:
      return translationString.action_type_esign_pod;
    case Constants.ActionType.BARCODE_POD:
      return translationString.action_type_barcode_pod;
    case Constants.ActionType.BARCODEESIGN_POD:
      return translationString.action_type_barcode_esign_pod;
    case Constants.ActionType.SKU_POD:
      return translationString.action_type_sku_pod;
    case Constants.ActionType.ESIGNBARCODE_POD:
      return translationString.action_type_esign_barcode_pod;
    case Constants.ActionType.RESEND:
      return translationString.action_type_resend;
    case Constants.ActionType.COLLECT_SUCCESS:
      return translationString.action_type_collect_success;
    case Constants.ActionType.COLLECT_FAIL:
      return translationString.action_type_collect_fail;
    case Constants.ActionType.RECOLLECT:
      return translationString.action_type_recollect;
    case Constants.ActionType.JOB_TRANSFER:
      return translationString.action_type_job_transfer;
    case Constants.ActionType.JOB_RECEIVE:
      return translationString.action_type_job_receive;
    default:
      return `Unknown Action (${type})`; // Or translationString.action_type_unknown_with_param.replace('{type}', type)
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const UploadProgressScreen = ({navigation}) => {
  const {epodRealm, auth, EpodRealmHelper} = useContext(IndexContext);
  const {showLoginModal} = useRefreshTokenLogin();
  const actionSyncHook = useActionSync();

  const [pendingActions, setPendingActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryingItems, setRetryingItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDisplayStatusFilter, setActiveDisplayStatusFilter] =
    useState('All'); // All, Pending, Failed, Synced
  const [allFetchedActions, setAllFetchedActions] = useState([]);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [hasUnsyncedActions, setHasUnsyncedActions] = useState(false);
  const [isCheckingSync, setIsCheckingSync] = useState(false);

  const checkUnsyncedActions = useCallback(async () => {
    if (!epodRealm || epodRealm.isClosed) {
      return false;
    }

    try {
      setIsCheckingSync(true);

      const syncedActions = await ActionRealmManager.getAllActionsByStatus(
        [Constants.SyncStatus.SYNC_SUCCESS],
        epodRealm,
      );

      if (syncedActions.length === 0) {
        setHasUnsyncedActions(false);
        return false;
      }

      const actionGuids = syncedActions.map((action) => action.guid);

      const response = await ApiController.checkUnsyncedGuidsApi(actionGuids);

      if (
        response &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        await Promise.all(
          response.data.map((guid) =>
            ActionRealmManager.updateActionsSyncToPendingBasedOnGUID(
              epodRealm,
              guid,
            ),
          ),
        );
        setHasUnsyncedActions(true);
        await loadPendingData();
        return true;
      }

      setHasUnsyncedActions(false);
      return false;
    } catch (error) {
      console.error('Error checking unsynced actions:', error);
      return false;
    } finally {
      setIsCheckingSync(false);
    }
  }, [epodRealm]);

  const loadPendingData = useCallback(async () => {
    if (!epodRealm || epodRealm.isClosed) {
      return;
    }
    setIsLoading(true);
    try {
      const actions = await ActionRealmManager.getAllActionsByStatus(
        [
          Constants.SyncStatus.SYNC_PENDING,
          Constants.SyncStatus.SYNC_LOCK,
          Constants.SyncStatus.SYNC_FAILED,
          Constants.SyncStatus.SYNC_PARTIAL_SUCCESS,
          Constants.SyncStatus.SYNC_SUCCESS,
        ],
        epodRealm,
      );

      const actionsWithDetails = await Promise.all(
        actions.map(async (action) => {
          const actionJSON = action.isValid
            ? GeneralHelper.convertRealmObjectToJSON(action)
            : action;

          const photos = await PhotoRealmManager.getAllPhotoByActionGuid(
            actionJSON.guid,
            epodRealm,
          );
          const photosJSON = photos.map((p) =>
            p.isValid ? GeneralHelper.convertRealmObjectToJSON(p) : p,
          );

          return {
            ...actionJSON,
            photos: photosJSON,
            displayStatus: determineActionDisplayStatus(actionJSON, photosJSON),
          };
        }),
      );

      actionsWithDetails.sort((a, b) => {
        const timeA = a.operateTime ? new Date(a.operateTime).getTime() : 0;
        const timeB = b.operateTime ? new Date(b.operateTime).getTime() : 0;

        return timeB - timeA;
      });

      setAllFetchedActions(actionsWithDetails);
    } catch (error) {
      console.error('Error loading pending data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [epodRealm, EpodRealmHelper]);

  useFocusEffect(
    useCallback(() => {
      const checkSync = async () => {
        await loadPendingData();
        await checkUnsyncedActions();
      };
      checkSync();
    }, [loadPendingData, checkUnsyncedActions]),
  );

  useEffect(() => {
    let filtered = [...allFetchedActions];

    if (searchQuery) {
      filtered = filtered.filter((action) =>
        action.jobId
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    }

    if (activeDisplayStatusFilter !== 'All') {
      filtered = filtered.filter((action) => {
        const displayStatus = action.displayStatus?.toLowerCase() || '';
        if (activeDisplayStatusFilter === 'Pending') {
          return (
            displayStatus.includes('pending') ||
            displayStatus.includes('syncing') ||
            displayStatus.includes('uploading') ||
            displayStatus.includes('processing')
          );
        }
        if (activeDisplayStatusFilter === 'Failed') {
          return (
            displayStatus.includes('failed') || displayStatus.includes('error')
          );
        }
        if (activeDisplayStatusFilter === 'Synced') {
          return displayStatus === 'synced';
        }
        return true;
      });
    }

    filtered.sort((a, b) => {
      const timeA = a.operateTime ? new Date(a.operateTime).getTime() : 0;
      const timeB = b.operateTime ? new Date(b.operateTime).getTime() : 0;
      return timeB - timeA;
    });

    setPendingActions(filtered);
  }, [allFetchedActions, searchQuery, activeDisplayStatusFilter]);

  const getRetryableActions = useCallback(() => {
    return pendingActions.filter((action) => {
      const displayStatus = action.displayStatus?.toLowerCase() || '';
      return (
        displayStatus.includes('failed') ||
        displayStatus.includes('error') ||
        displayStatus.includes('pending')
      );
    });
  }, [pendingActions]);

  const handleRetryAllFailed = async () => {
    const retryableActions = getRetryableActions();
    if (retryableActions.length === 0 || isRetryingAll) return;

    setIsRetryingAll(true);
    try {
      for (const action of retryableActions) {
        await handleRetryAction(action.guid);

        const photosToRetry = action.photos?.filter(
          (p) =>
            p.syncStatus === Constants.SyncStatus.SYNC_FAILED ||
            p.syncStatus === Constants.SyncStatus.SYNC_PENDING,
        );
        if (photosToRetry && photosToRetry.length > 0) {
          await handleRetryPhotos(action.guid);
        }
      }
    } catch (error) {
      console.error('Error during Retry All:', error);
    } finally {
      setIsRetryingAll(false);
      await loadPendingData();
    }
  };

  const determineActionDisplayStatus = (action, photos) => {
    if (!action || typeof action.syncStatus === 'undefined')
      return 'Data Error';

    if (action.syncStatus === Constants.SyncStatus.SYNC_LOCK)
      return 'Syncing Action...';
    if (action.syncStatus === Constants.SyncStatus.SYNC_FAILED)
      return 'Action Sync Failed';
    if (action.syncStatus === Constants.SyncStatus.SYNC_PENDING)
      return 'Action Pending Sync';

    const allPhotosSynced = photos.every(
      (p) => p.syncStatus === Constants.SyncStatus.SYNC_SUCCESS,
    );

    if (
      action.syncStatus === Constants.SyncStatus.SYNC_SUCCESS ||
      action.syncStatus === Constants.SyncStatus.SYNC_PARTIAL_SUCCESS
    ) {
      if (photos.length > 0 && !allPhotosSynced) {
        const pendingPhotosCount = photos.filter(
          (p) =>
            p.syncStatus === Constants.SyncStatus.SYNC_PENDING ||
            p.syncStatus === Constants.SyncStatus.SYNC_LOCK,
        ).length;
        const failedPhotosCount = photos.filter(
          (p) => p.syncStatus === Constants.SyncStatus.SYNC_FAILED,
        ).length;
        if (failedPhotosCount > 0) return 'Photo Upload Failed';
        if (pendingPhotosCount > 0)
          return `Uploading Photos (${photos.length - pendingPhotosCount}/${
            photos.length
          })...`;
        return 'Processing Photos...';
      }

      if (
        (action.syncStatus === Constants.SyncStatus.SYNC_SUCCESS ||
          action.sync_status === Constants.SyncStatus.SYNC_PARTIAL_SUCCESS) &&
        allPhotosSynced
      ) {
        return 'Synced';
      }
    }

    if (
      action.syncStatus === Constants.SyncStatus.SYNC_PENDING &&
      photos.length > 0
    )
      return 'Action Pending, Photos Waiting';

    return 'Status Unknown';
  };

  const handleRetryAction = async (actionGuid) => {
    if (!actionGuid) return;
    setRetryingItems((prev) => ({...prev, [actionGuid]: true}));
    try {
      const actionToRetry = await ActionRealmManager.getActionByGuid(
        actionGuid,
        epodRealm,
      );
      if (actionToRetry && actionToRetry.isValid()) {
        const actionToRetryJSON =
          GeneralHelper.convertRealmObjectToJSON(actionToRetry);

        await ActionRealmManager.updateActionData(
          {
            guid: actionGuid,
            syncStatus: Constants.SyncStatus.SYNC_PENDING,
            executeTime: new Date().getTime(),
          },
          epodRealm,
        );

        await actionSyncHook.callActionSyncApi([actionToRetryJSON]); // Assumes callActionSyncApi handles a list
        console.log('Retry for action initiated:', actionGuid);
      } else {
        console.warn('Action not found or invalid for retry:', actionGuid);
      }
    } catch (error) {
      console.error('Error retrying action:', actionGuid, error);
      await ActionRealmManager.updateActionData(
        {guid: actionGuid, syncStatus: Constants.SyncStatus.SYNC_FAILED},
        epodRealm,
      );
    } finally {
      setRetryingItems((prev) => ({...prev, [actionGuid]: false}));
      await loadPendingData();
    }
  };

  const handleRetryPhotos = async (actionGuid) => {
    if (!actionGuid) return;
    setRetryingItems((prev) => ({...prev, [`photos_${actionGuid}`]: true}));
    try {
      const actionModel = await ActionRealmManager.getActionByGuid(
        actionGuid,
        epodRealm,
      );

      if (
        actionModel &&
        actionModel.isValid() &&
        (actionModel.syncStatus === Constants.SyncStatus.SYNC_SUCCESS ||
          actionModel.syncStatus === Constants.SyncStatus.SYNC_PARTIAL_SUCCESS)
      ) {
        const photos = await PhotoRealmManager.getAllPhotoByActionGuid(
          actionGuid,
          epodRealm,
        );
        let hasFailedOrPendingPhotos = false;
        for (const photo of photos) {
          if (photo.syncStatus !== Constants.SyncStatus.SYNC_SUCCESS) {
            hasFailedOrPendingPhotos = true;
            await PhotoRealmManager.updateSyncStatusByUUID(
              photo.uuid,
              Constants.SyncStatus.SYNC_PENDING,
              epodRealm,
            );
          }
        }
        if (hasFailedOrPendingPhotos) {
          await PhotoHelper.getAllActionWithPendingPhoto(
            epodRealm,
            showLoginModal,
            auth,
          );
          console.log('Retry for photos initiated for action:', actionGuid);
        } else {
          console.log('No photos to retry for action:', actionGuid);
        }
      } else if (actionModel && actionModel.isValid()) {
        console.warn(
          'Action itself is not synced, retry action first before photos:',
          actionGuid,
          actionModel.syncStatus,
        );
      } else {
        console.warn(
          'Action not found or invalid for photo retry:',
          actionGuid,
        );
      }
    } catch (error) {
      console.error('Error retrying photos for action:', actionGuid, error);
    } finally {
      setRetryingItems((prev) => ({...prev, [`photos_${actionGuid}`]: false}));
      await loadPendingData();
    }
  };

  const renderActionItem = ({item}) => {
    const isActionRetrying = retryingItems[item.guid];
    const arePhotosRetrying = retryingItems[`photos_${item.guid}`];

    const canRetryAction =
      (item.syncStatus === Constants.SyncStatus.SYNC_FAILED ||
        item.syncStatus === Constants.SyncStatus.SYNC_PENDING) &&
      !isActionRetrying;

    const canRetryPhotos =
      (item.syncStatus === Constants.SyncStatus.SYNC_SUCCESS ||
        item.syncStatus === Constants.SyncStatus.SYNC_PARTIAL_SUCCESS) &&
      item.photos.some(
        (p) =>
          p.syncStatus === Constants.SyncStatus.SYNC_FAILED ||
          p.syncStatus === Constants.SyncStatus.SYNC_PENDING,
      ) &&
      !arePhotosRetrying;

    return (
      <View style={styles.actionItemContainer}>
        <Text style={styles.jobIdText}>
          {translationString.job_id_label}: {item.jobId}
        </Text>
        <Text style={styles.actionText}>
          {translationString.action_id_label}: {item.guid}
        </Text>
        <Text style={styles.actionTextDetail}>
          {translationString.operated_date_label}:{' '}
          {formatTimestamp(item.operateTime)}
        </Text>
        <Text style={styles.actionTypeText}>
          {translationString.type_label}: {getActionTypeText(item.actionType)}
        </Text>
        <Text
          style={[
            styles.statusText,
            {
              color:
                item.displayStatus === 'Synced'
                  ? Constants.Completed_Color
                  : item.displayStatus?.includes('Failed')
                  ? Constants.Failed_Color
                  : Constants.Pending_Color,
            },
          ]}>
          {translationString.overall_status_label}: {item.displayStatus}
        </Text>
        <Text style={styles.actionTextDetail}>
          {translationString.action_status_label}{' '}
          {getSyncStatusText(item.syncStatus)}
        </Text>

        {item.photos && item.photos.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.subHeaderText}>
              {translationString.photos_label} ({item.photos.length}):
            </Text>
            {item.photos.map((photo) => (
              <View key={photo.uuid} style={styles.photoDetailContainer}>
                {photo.file ? (
                  <Image source={{uri: photo.file}} style={styles.thumbnail} />
                ) : (
                  <View style={styles.thumbnailPlaceholder} />
                )}
                <Text style={styles.detailTextSmall}>
                  {photo.fileName || photo.uuid?.substring(0, 8)}
                  {': '}
                  {getSyncStatusText(photo.syncStatus)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {canRetryAction && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              isActionRetrying && styles.disabledButton,
            ]}
            onPress={() => handleRetryAction(item.guid)}
            disabled={isActionRetrying}>
            {isActionRetrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.retryButtonText}>
                {translationString.sync_action_button}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {canRetryPhotos && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              arePhotosRetrying && styles.disabledButton,
              {marginTop: 5},
            ]}
            onPress={() => handleRetryPhotos(item.guid)}
            disabled={arePhotosRetrying}>
            {arePhotosRetrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.retryButtonText}>
                {translationString.sync_photos_button}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading && pendingActions.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image source={BackButton} />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {translationString.upload_progress_title}
        </Text>
        {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {getRetryableActions().length > 0 ? (
            <TouchableOpacity
              style={[
                styles.retryAllButton,
                isRetryingAll && styles.disabledButton,
              ]}
              onPress={handleRetryAllFailed}
              disabled={isRetryingAll}>
              {isRetryingAll ? (
                <ActivityIndicator size="small" color={Constants.THEME_COLOR} />
              ) : (
                <Text style={styles.retryAllButtonText}>
                  {translationString.retry_all_button}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{width: hasUnsyncedActions ? 10 : 60}} />
          )}
        </View> */}
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={translationString.search_placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        <View style={styles.filterButtonsContainer}>
          {['All', 'Pending', 'Failed', 'Synced'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                activeDisplayStatusFilter === status &&
                  styles.activeFilterButton,
              ]}
              onPress={() => setActiveDisplayStatusFilter(status)}>
              <Text
                style={[
                  styles.filterButtonText,
                  activeDisplayStatusFilter === status &&
                    styles.activeFilterButtonText,
                ]}>
                {translationString[status.toLowerCase() + '_filter']}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {pendingActions.length === 0 && !isLoading ? (
        <View style={styles.centered}>
          <Text>{translationString.nothing_to_display}</Text>
        </View>
      ) : (
        <FlatList
          data={pendingActions}
          renderItem={renderActionItem}
          keyExtractor={(item) => item.guid}
          contentContainerStyle={styles.listContentContainer}
          refreshing={isLoading}
          onRefresh={async () => {
            await loadPendingData();
            await checkUnsyncedActions();
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Constants.Light_Grey,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Light_Grey,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: Constants.WHITE,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Constants.THEME_COLOR,
  },
  activeFilterButton: {
    backgroundColor: Constants.THEME_COLOR,
  },
  filterButtonText: {
    color: Constants.THEME_COLOR,
    fontSize: 14,
    fontFamily: Constants.fontFamilyRegular,
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  retryAllButton: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  retryAllButtonText: {
    color: Constants.WHITE,
    fontSize: 16,
    fontFamily: Constants.fontFamilySemiBold,
  },
  syncButton: {
    backgroundColor: Constants.THEME_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButtonText: {
    color: Constants.WHITE,
    fontSize: 14,
    fontFamily: Constants.fontFamilySemiBold,
  },
  actionItemContainer: {
    backgroundColor: Constants.WHITE,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor:
      Platform.OS === 'android' ? 'transparent' : Constants.Light_Grey,
  },
  actionText: {
    fontSize: 10,
    fontFamily: Constants.fontFamily,
    color: Constants.Text_Color,
    marginBottom: 5,
  },
  jobIdText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansBoldFont || Constants.fontFamily,
    fontWeight: 'bold',
    color: Constants.THEME_COLOR,
  },
  actionTypeText: {
    fontSize: Constants.normalFontSize,
    fontFamily: Constants.fontFamily,
    color: Constants.Text_Color,
    marginBottom: 5,
  },
  statusText: {
    fontSize: Constants.normalFontSize,
    fontFamily: Constants.fontFamily,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionTextDetail: {
    fontSize: Constants.normalFontSize - 1,
    fontFamily: Constants.fontFamily,
    color: Constants.Order_Item_Color,
    marginBottom: 3,
  },
  detailSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Constants.Light_Grey,
  },
  subHeaderText: {
    fontSize: Constants.normalFontSize,
    fontFamily: Constants.NoboSansBoldFont || Constants.fontFamily,
    fontWeight: 'bold',
    color: Constants.Text_Color,
    marginBottom: 8,
  },
  detailText: {
    fontSize: Constants.normalFontSize - 1,
    fontFamily: Constants.fontFamily,
    color: Constants.Order_Item_Color,
    marginBottom: 4,
  },
  photoDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 5,
    backgroundColor: Constants.Light_Grey,
  },
  detailTextSmall: {
    fontSize: Constants.normalFontSize - 2,
    fontFamily: Constants.fontFamily,
    color: Constants.Order_Item_Color,
    flexShrink: 1,
  },
  retryButton: {
    backgroundColor: Constants.THEME_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    minWidth: 150,
    alignSelf: 'flex-start',
  },
  disabledButton: {
    backgroundColor: Constants.Disable_Color,
  },
  retryButtonText: {
    color: Constants.WHITE,
    fontSize: Constants.buttonFontSize - 1,
    fontFamily: Constants.NoboSansBoldFont || Constants.fontFamily,
    fontWeight: 'bold',
  },
  noActionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noActionsText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.fontFamily,
    color: Constants.Order_Item_Color,
    textAlign: 'center',
  },

  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: Constants.THEME_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: Constants.Light_Grey,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: Constants.buttonFontSize + 2,
    color: Constants.WHITE,
    fontFamily: Constants.NoboSansBoldFont || Constants.fontFamily,
    fontWeight: 'bold',
    flex: 1,
    paddingLeft: 10,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: Constants.WHITE,
    fontFamily: Constants.fontFamily,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Light_Grey,
  },
});

export default UploadProgressScreen;
