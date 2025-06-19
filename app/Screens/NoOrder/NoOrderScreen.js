import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginLoadingIndicator from '../../Components/LoginLoadingIndicator';
import CustomAlertView from '../../Components/CustomAlertView';
import * as Constants from '../../CommonConfig/Constants';
import CancelIcon from '../../Assets/image/icon_failed.png';
import RetryIcon from '../../Assets/image/icon_success.png';
import {useNoOrder} from '../../Hooks/NoOrder/useNoOrder';
import {translationString} from '../../Assets/translation/Translation';
import {IndexContext} from '../../Context/IndexContext';
import {useActionSync} from '../../Hooks/ActionSync/useActionSync';

export default ({route, navigation}) => {
  const {
    networkModel,
    isShowLoadingIndicator,
    cancelButtonOnPressed,
    retryButtonOnPressed,
    alertMsg,
  } = useNoOrder(route, navigation);
  const {noOrderMsg} = React.useContext(IndexContext);
  const {
    getAllPendingAction,
    callActionSyncApi,
    updateActionSyncLock,
    updateActionsSyncLockToPending,
    syncPhotos,
    getAllJobPostponePendingList,
    callJobPoseponeSyncApi,
  } = useActionSync();

  const windowWidth = Dimensions.get('screen').width;
  const windowHeight = Dimensions.get('screen').height;

  // useEffect(() => {
  //   queue.addWorker(
  //     'syncActionWorker',
  //     async (id, payload) => {
  //       console.log(
  //         'EXECUTING "syncActionWorker - No Order Screen" with id: ' + id,
  //       );
  //       updateActionsSyncLockToPending();
  //       let pendingActionList = await getAllPendingAction();
  //       // keep alive until pendingActionList.length = 0
  //       while (pendingActionList && pendingActionList.length > 0) {
  //         await updateActionSyncLock(pendingActionList);
  //         await callActionSyncApi(pendingActionList);
  //         updateActionsSyncLockToPending();
  //         pendingActionList = await getAllPendingAction();
  //       }
  //       // todo get photo
  //       await syncPhotos();
  //       updateActionsSyncLockToPending();
  //       const pendingActionsList = await getAllPendingAction(true);

  //       if (pendingActionsList && pendingActionsList.length > 0) {
  //         await updateActionSyncLock(pendingActionsList);
  //         await callActionSyncApi(pendingActionsList);
  //       }
  //       await syncPhotos();

  //       let jpPendingActionList = await getAllJobPostponePendingList();

  //       // console.log(jpPendingActionList);
  //       // keep alive until pendingActionList.length = 0
  //       // while (jpPendingActionList && jpPendingActionList.length > 0) {
  //       await callJobPoseponeSyncApi(jpPendingActionList);
  //       //   jpPendingActionList = await getAllJobPostponePendingList();
  //       // }
  //     },
  //     {
  //       concurrency: 1,
  //       onStart: async (id, payload) => {
  //         // const pendingActionList = await getAllPendingAction();
  //         // callActionSyncApi(pendingActionList);
  //         // get pending list
  //         // based on action
  //         console.log(
  //           'Job "job-name-here" with id ' + id + ' has started processing.',
  //         );
  //         AsyncStorage.setItem('QUEUE_ERROR', 'false');

  //         // call api
  //       },
  //       onCompletion: async (id, payload) => {
  //         console.log(
  //           'Job "job-name-here" with id ' + id + ' has completed processing.',
  //         );
  //         AsyncStorage.setItem('QUEUE_ERROR', 'false');
  //       },
  //       onSuccess: async (id, payload) => {
  //         AsyncStorage.setItem('QUEUE_ERROR', 'false');
  //         console.log('Job "job-name-here" with id ' + id + ' was successful.');
  //       },
  //       onFailure: async (id, payload) => {
  //         AsyncStorage.setItem('QUEUE_ERROR', 'true');

  //         console.log(
  //           'Job "job-name-here" with id ' +
  //             id +
  //             ' had an attempt end in failure.',
  //           payload,
  //         );
  //       },
  //     },
  //   );
  // }, []);

  const handleUploadAction = async () => {
    try {
      updateActionsSyncLockToPending();
      var pendingList = await getAllPendingAction();
      console.log(pendingList);
      if (pendingList.length > 0) {
        callActionSyncApi(pendingList);
      }
      updateActionsSyncLockToPending();
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      setTimeout(() => {
        handleUploadAction();
      }, 1000);
    });
    return () => {
      focusListener();
    };
  });

  return (
    <View style={styles.noOrderBaseContainer}>
      <View style={[styles.baseContainer, {width: windowWidth}]}>
        <Text style={styles.failedLabel}>{noOrderMsg}</Text>
      </View>
      <View
        style={[
          styles.horizontalContainer,
          {width: windowWidth, height: windowHeight * 0.2},
        ]}>
        <TouchableOpacity
          focusable={false}
          style={[styles.cancelButton, {width: windowWidth * 0.5}]}
          onPress={cancelButtonOnPressed}>
          <View>
            <Image style={styles.icon} source={CancelIcon} />
            <Text style={styles.cancelButtonText}>
              {translationString.cancel_btn}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, {width: windowWidth * 0.5}]}
          onPress={retryButtonOnPressed}>
          <View>
            <Image style={styles.icon} source={RetryIcon} />
            <Text style={styles.retryButtonText}>
              {translationString.retry}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {networkModel.isConnected && (
        <LoginLoadingIndicator
          isVisible={isShowLoadingIndicator}
          message={translationString.downloading}
        />
      )}
      {alertMsg !== '' && <CustomAlertView alertMsg={alertMsg} />}
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrderBaseContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  noOrderContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  navBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  failedLabel: {
    fontSize: 20,
    fontFamily: Constants.fontFamily,
  },
  cancelButton: {
    width: Constants.screenWidth / 2,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Light_Grey,
  },
  cancelButtonText: {
    fontFamily: Constants.fontFamily,
    fontSize: 20,
    color: Constants.Dark_Grey,
    padding: 6,
  },
  retryButton: {
    width: Constants.screenWidth / 2,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Completed_Color,
  },
  retryButtonText: {
    fontFamily: Constants.fontFamily,
    fontSize: 20,
    color: 'white',
    padding: 6,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  icon: {
    margin: 6,
  },
});
