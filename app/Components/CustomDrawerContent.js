/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  SafeAreaView,
  Alert,
  AppState,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import moment, {duration} from 'moment';
import DeviceInfo from 'react-native-device-info';
import BackgroundImage from '../Assets/image/img_sidemenubg.png';
import KerryLogo from '../Assets/image/img_sidemenu_logo.png';
import OfflineIcon from '../Assets/image/icon_ofline.png';
import ReorderingIcon from '../Assets/image/icon_sidemenu_asign.png';
import TransferIcon from '../Assets/image/icon_transfer.png';
import JobTransferIcon from '../Assets/image/job_transfer_icon.png';
import LanguageIcon from '../Assets/image/icon_language_grey.png';
import LogoutIcon from '../Assets/image/icon_logout.png';
import HomeIcon from '../Assets/image/icon_home.png';
import {ImageRes} from '../Assets';
import PullIcon from '../Assets/image/icon_pull.png';
import * as Constants from '../CommonConfig/Constants';
import * as ActionRealmManager from '../Database/realmManager/ActionRealmManager';
import * as JobRealmManager from '../Database/realmManager/JobRealmManager';
import * as ApiController from '../ApiController/ApiController';
import {useSelector, useDispatch} from 'react-redux';
import {translationString} from '../Assets/translation/Translation';
import {IndexContext} from '../Context/IndexContext';
import {createAction} from '../Actions/CreateActions';
import * as ActionType from '../Actions/ActionTypes';
import {useMasterData} from '../Hooks/MasterData/useMasterData';
import {useDeltaSync} from '../Hooks/DeltaSync/useDeltaSync';
import {useActionSync} from '../Hooks/ActionSync/useActionSync';
import LoadingModal from './LoadingModal';
import Logout from './Logout';
// import {usePhotoHelper} from '../Hooks/Exports/usePhotoHelper';
// import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import * as RNFS from 'react-native-fs';
import {
  exportToJson,
  getSchemaNameByIndex,
} from '../Database/realmManager/ExportRealmManager';
import XLSX from 'xlsx';
import {DrawerActions} from '@react-navigation/native';
import * as Toast from './Toast/ToastMessage';
import {CustomDialogView} from '../Components//General/CustomDialogView';
import {useLocation} from '../Hooks/Location/useLocation';
import {UploadDatabaseService} from '../Database/UploadDatabaseService';
import notifee, {
  TimestampTrigger,
  TriggerType,
  TimeUnit,
  RepeatFrequency,
  EventType,
} from '@notifee/react-native';
import {useNetwork} from '../Hooks/Network/useNetwork';
import JobRequestIcon from '../Assets/image/handshake.png';
import ConnectionStateDot from './ConnectionStateDot';
import {AppContext} from '../Context/AppContext';

const CustomDrawerContent = ({navigation}) => {
  const networkModel = useSelector((state) => state.NetworkReducer);
  const languageModel = useSelector((state) => state.LanguageReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const {auth, authState, manifestData, epodRealm} =
    React.useContext(IndexContext);
  const dispatch = useDispatch();
  const {locationModel, setGPSTracking} = useLocation();
  const {callGetMasterDataApi} = useMasterData();
  const {callGetDeltaSyncApi} = useDeltaSync(
    callGetMasterDataApi,
    'CustomDrawerContent',
  );
  const [isLoading, setLoading] = useState(false);
  const {
    callActionSyncApi,
    getAllPendingAction,
    updateActionSyncLock,
    updateActionsSyncLockToPending,
    getAllPendingLockAction,
  } = useActionSync();

  const {uploadDatabase} = UploadDatabaseService();

  // const {getAllImagePatch} = usePhotoHelper();
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isShowReDialog, setIsShowReDialog] = useState(false);
  const [allowedModules, setAllowedModules] = useState([]);
  const {connectionState} = React.useContext(AppContext);

  useEffect(() => {
    // async function getnoti() {
    //   const noti = await notifee.getTriggerNotifications();
    //   console.log('Get Noti Length', noti.length);
    //   for (var x of noti) {
    //     console.log('Get Noti Id', x.notification.id);
    //   }
    // }

    async function createNoti() {
      // console.log('App State Not Active: Add Noti');
      var pendingList = await getAllPendingLockAction();
      console.log('Total Pending List: ' + pendingList);
      if (pendingList > 0) {
        // console.log('Create New Notification');
        await displayNotification(pendingList);
        await keepOneLocalNotification();
      } else {
        // console.log('Cancel All Notification');
        cancelAllLocalNotification();
      }
      // console.log('App State Not Active: Add Noti END');
    }

    if (userModel == null || userModel.name === '') {
      AsyncStorage.getItem(Constants.USER_MODEL).then((res) => {
        if (res) {
          let userModel = JSON.parse(res);
          getAllowedModules(userModel.companyId);
          dispatch(createAction(ActionType.SET_USER_MODEL, userModel));
        }
      });
    } else {
      getAllowedModules(userModel.companyId);
    }

    AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        try {
          const res = await AsyncStorage.getItem(
            Constants.LAST_DElTA_SYNC_TIME,
          );
          if (res) {
            if (manifestData.id) {
              const diffInMins = moment
                .duration(moment().utc().diff(moment.utc(res)))
                .asMinutes();
              if (diffInMins > 5) {
                await callGetDeltaSyncApi();
              }
            }
          }
        } catch (error) {
          console.error('Error getting last sync time:', error); // Handle errors!
        }

        cancelAllLocalNotification();
      } else {
        createNoti();
      }
    });
  }, []);

  const cancelAllLocalNotification = async () => {
    const noti = await notifee.getTriggerNotifications();
    // console.log('get cancel Noti', noti.length);
    for (var x of noti) {
      // console.log('Cancel Noti id', x.notification.id);
      await notifee.cancelTriggerNotification(x.notification.id);
    }
  };

  const keepOneLocalNotification = async () => {
    const noti = await notifee.getTriggerNotifications();
    // console.log('get cancel Noti 2', noti.length);

    for (let i = 0; i < noti.length; i++) {
      const element = noti[i];

      if (i !== noti.length - 1) {
        await notifee.cancelTriggerNotification(element.notification.id);
      }
    }
  };

  const displayNotification = async (pendingAction) => {
    const trigger = {
      type: TriggerType.INTERVAL,
      interval: 60,
      timeUnit: TimeUnit.MINUTES,
    };

    // const trigger = {
    //   type: TriggerType.TIMESTAMP,
    //   timestamp: Date.now(), // fire in 3 hours
    //   repeatFrequency: RepeatFrequency.HOURLY, // repeat once a week
    // };

    await notifee.requestPermission();
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.createTriggerNotification(
      {
        title: translationString.action_pending_upload_title.toString(),
        body: translationString
          .formatString(
            translationString.action_pending_upload_body,
            pendingAction,
          )
          .toString(),
        android: {
          channelId,
          smallIcon: 'ic_launcher_round',
          color: '#e44a49',
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  };

  const callLogoutApi = async () => {
    try {
      await ApiController.userLogoutApi();
      auth.logout();
    } catch (err) {
      let errorModel = err.response.data;
      alert(errorModel.errorMessage);
    }
  };

  const handleRefresh = async () => {
    navigation.closeDrawer();
    setLoading(true);
    await handleDeltaSync();
    getAllowedModules(userModel.companyId);
    setLoading(false);
  };

  const handleDeltaSync = async () => {
    if (!networkModel.isConnected) {
      return;
    }

    console.log(
      `[DeltaSync] Custom Drawer Content initiated. Timestamp: ${new Date().toISOString()}.`,
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
        `[DeltaSync] Custom Drawer Content has ended. Timestamp: ${new Date().toISOString()}.`,
      );
    } catch (error) {
      console.log(error.message);
      console.log('DeltaSync got error');
    }
  };

  const displayBottomAlertMessage = (message) => {
    let filterMsgPayload = {
      filterSuccessMsg: message,
    };
    dispatch(createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload));
  };

  const checkCompletedJob = async (pendingJobList) => {
    const openJobList = pendingJobList.filter((jobModel) => {
      return jobModel.status <= Constants.JobStatus.IN_PROGRESS;
    });
    if (pendingJobList.length === 0 || openJobList.length === 0) {
      //logout
      Alert.alert(
        translationString.logout,
        translationString.logout_confirm,
        [
          {
            text: translationString.cancel,
            onPress: () => {},
          },
          {
            text: translationString.confirm,
            onPress: () => {
              callLogoutApi();
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      //pending job
      const pendingDeliverJobList = pendingJobList.filter((jobModel) => {
        return (
          jobModel.jobType === Constants.JobType.DELIVERY &&
          jobModel.status <= Constants.JobStatus.IN_PROGRESS &&
          !jobModel.isRemoved
        );
      });
      const pendingPickUpJobList = pendingJobList.filter((jobModel) => {
        return (
          jobModel.jobType === Constants.JobType.PICK_UP &&
          jobModel.status <= Constants.JobStatus.IN_PROGRESS &&
          !jobModel.isRemoved
        );
      });
      let alertMsg = translationString.please_complete_job;

      if (pendingDeliverJobList.length > 0) {
        alertMsg =
          alertMsg +
          translationString.formatString(
            translationString.pending_delivery_job_count,
            pendingDeliverJobList.length,
          );
      }

      if (pendingDeliverJobList.length > 0 && pendingPickUpJobList.length > 0) {
        alertMsg = alertMsg + translationString.and;
      }

      if (pendingPickUpJobList.length > 0) {
        alertMsg =
          alertMsg +
          translationString.formatString(
            translationString.pending_pickup_job_count,
            pendingPickUpJobList.length,
          );
      }
      displayBottomAlertMessage(alertMsg);
    }
  };

  const getTotalDownloadedJob = () => {
    const localJobList =
      JobRealmManager.getAllJobByStatusSortByDescStatusAscSeqAscTime(
        epodRealm,
        Constants.JobStatus.ALL,
      );

    const pendingJobList = localJobList.filter(
      (x) => x.status <= Constants.JobStatus.IN_PROGRESS,
    );

    const completeJobList = localJobList.filter(
      (x) => x.status === Constants.JobStatus.COMPLETED,
    );

    const failedJobList = localJobList.filter(
      (x) => x.status === Constants.JobStatus.FAILED,
    );

    const totalJob = localJobList ? localJobList.length : 0;
    const pendingJob = pendingJobList ? pendingJobList.length : 0;
    const completeJob = completeJobList ? completeJobList.length : 0;
    const failedJob = failedJobList ? failedJobList.length : 0;

    let title = translationString.formatString(
      translationString.confirm_total_downloaded,
      totalJob,
      completeJob + failedJob,
      pendingJob,
    );

    // title = title?.split("<br/>").join("\n")};

    return title;
  };

  const toWebView = async () => {
    navigation.closeDrawer();
    const REFRESH_TOKEN = await AsyncStorage.getItem(Constants.REFRESH_TOKEN);
    const ACCESS_TOKEN = await AsyncStorage.getItem(Constants.ACCESS_TOKEN);

    navigation.navigate('webView', {
      REFRESH_TOKEN,
      ACCESS_TOKEN,
      isRefresh: true,
    });
  };

  const getAllowedModules = async (companyId) => {
    try {
      const {data: modules} = await ApiController.getCompanyAllowedModule(
        companyId,
      );
      if (modules && modules.length > 0) {
        setAllowedModules(modules);
        AsyncStorage.setItem('allowedModules', JSON.stringify(modules));
      }
    } catch (err) {
      const m = await AsyncStorage.getItem('allowedModules');
      setAllowedModules(JSON.parse(m));
    }
  };

  const renderFlatListData = () => {
    //default list if company allowed module is null
    const dataList = [
      {
        id: 0,
        name: 'home',
        title: translationString.home,
        icon: HomeIcon,
        sequence: 1,
      },
      {
        id: 10, // New item for Upload Progress
        name: 'UploadProgressScreen',
        title: translationString.upload_progress_title,
        iconName: 'cloud-upload-outline', // Using Ionicons
        isIonicons: true, // Flag to identify Ionicon
        sequence: 4.5, // Position after Marketplace, before Job Transfer/Language
      },
      {
        id: 3,
        name: 'language',
        title: languageModel.title,
        icon: LanguageIcon,
        sequence: 6,
      },
      {
        id: 4,
        name: 'logout',
        title: translationString.logout,
        icon: LogoutIcon,
        sequence: 6,
      },
      {
        id: 5,
        name: 'networkDebugger',
        title: 'Network debugger',
        icon: LogoutIcon, // Note: Uses LogoutIcon, as in original code
        sequence: 8,
      },
      {
        id: 9,
        name: 'back',
        title: translationString.back,
        icon: ImageRes.BackButton,
        sequence: 9,
      },
    ];

    //configurable module list (configurable module please add here)
    const modules = [
      {
        id: 2,
        name: 'routeSequencing',
        title: manifestData.isForcedSequencing
          ? translationString.route_sequencing
          : translationString.resort,
        icon: ReorderingIcon,
        sequence: 2,
      },
      {
        id: 6,
        name: 'marketplace',
        icon: TransferIcon,
        title: translationString.market_place_title,
        sequence: 4,
      },
      {
        id: 1,
        name: 'jobRequest',
        title: translationString.job_requests,
        icon: JobRequestIcon,
        sequence: 3,
      },
      {
        id: 7,
        name: 'jobTransfer',
        icon: JobTransferIcon,
        title: translationString.job_transfer,
        sequence: 5,
      },
      {
        id: 8,
        name: 'uploadDb',
        title: translationString.upload_db,
        icon: PullIcon,
        sequence: 7,
      },
    ];

    if (allowedModules.length > 0) {
      allowedModules.forEach((module) => {
        if (module !== 'all') {
          const moduleObj = modules.filter(
            (m) => m.name.toLowerCase() === module.toLowerCase(),
          );
          dataList.push(...moduleObj);
        } else {
          dataList.push(...modules);
        }
      });
    }

    dataList.sort((a, b) => a.sequence - b.sequence);

    return dataList;
  };

  return (
    <View style={styles.baseContainer}>
      <FlatList
        style={styles.baseContainer}
        bounces={false}
        data={renderFlatListData()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={async () => {
              if (item.id === 0) {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'MainTab'}],
                });
              } else if (item.name === 'UploadProgressScreen') {
                navigation.navigate('UploadProgressScreen');
              } else if (item.id === 1) {
                navigation.navigate('JobRequest');
              } else if (item.id === 5) {
                navigation.navigate('Network');
              } else if (item.id === 9) {
                navigation.back();
              }

              if (item.title === translationString.market_place_title) {
                navigation.navigate('MarketPlace');
              }
              if (item.title === languageModel.title) {
                navigation.navigate('Language');
              }
              // else if (item.title === translationString.job_transfer) {
              //   navigation.navigate('SelectReason', {
              //     job: {},
              //     reasonType: Constants.ReasonType.JOB_TRANSFER_REASON,
              //     actionModel: {},
              //     stepCode: '',
              //   });
              // }
              else if (item.id === 2) {
                console.log(
                  'manifestData.isForcedSequencing',
                  manifestData.isForcedSequencing,
                );
                console.log('sequencedStatus', manifestData.sequencedStatus);
                console.log('sequenceLimit', manifestData.sequenceLimit);
                console.log('sequencedCount', manifestData.sequencedCount);
                if (
                  //TODO Check the company is allow sequencing?
                  manifestData.isForcedSequencing &&
                  // manifestData.sequenceLimit > 0 &&
                  (manifestData.sequencedStatus === 0 ||
                    manifestData.sequencedStatus === 2)
                ) {
                  navigation.closeDrawer();
                  if (
                    manifestData.sequencedStatus === 0 ||
                    manifestData.sequencedStatus === 2
                  ) {
                    setIsShowDialog(true);
                  }
                  // else if (
                  //   manifestData.sequencedCount < manifestData.sequenceLimit
                  // ) {
                  //   setIsShowReDialog(true);
                  // }
                  else {
                    await toWebView();
                  }
                } else if (
                  manifestData.isForcedSequencing &&
                  manifestData.sequencedStatus === 1
                ) {
                  setIsShowReDialog(true);
                } else if (
                  (!manifestData.isForcedSequencing ||
                    manifestData.isForcedSequencing == null ||
                    manifestData.isForcedSequencing === undefined) &&
                  (manifestData.sequencedStatus !== 1 ||
                    manifestData.sequencedStatus !== 2)
                ) {
                  navigation.closeDrawer();
                  navigation.navigate('Reorder');
                } else {
                  await toWebView();
                }
              } else if (item.id === 8) {
                navigation.dispatch(DrawerActions.closeDrawer());
                uploadDatabase(true, 0);
              } else if (item.title === translationString.logout) {
                const manifestId = manifestData.id;
                navigation.closeDrawer();
                Logout(
                  dispatch,
                  networkModel,
                  authState,
                  auth,
                  epodRealm,
                  callActionSyncApi,
                  getAllPendingAction,
                  callGetMasterDataApi,
                  callGetDeltaSyncApi,
                  false,
                  updateActionsSyncLockToPending,
                  updateActionSyncLock,
                  manifestId,
                  userModel,
                  false,
                  setGPSTracking,
                );
              } else if (item.id === 7) {
                navigation.closeDrawer();
                navigation.navigate('JobTransfer');
              } else {
                navigation.closeDrawer();
              }
            }}>
            {item.isIonicons ? (
              <Icon
                name={item.iconName}
                size={24} // Standard size for icons
                color={'black'} // Matches existing icon tintColor
                style={styles.icon} // Apply similar styling
              />
            ) : (
              <Image
                style={styles.icon}
                source={item.icon}
                resizeMode={'contain'}
              />
            )}
            <Text style={styles.itemTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View>
            <ImageBackground
              style={styles.backImg}
              resizeMode={'stretch'}
              source={BackgroundImage}>
              <SafeAreaView>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 5,
                  }}>
                  <Text style={styles.username}>{userModel.name}</Text>
                  <View>
                    <ConnectionStateDot state={connectionState} />
                  </View>
                </View>
                <Text style={styles.truckNo}>
                  {translationString.formatString(
                    translationString.truck_num,
                    userModel.truckNo ? userModel.truckNo : '-',
                  )}
                </Text>
                <Text style={styles.truckNo}>
                  {translationString.formatString(
                    translationString.phone_num,
                    userModel.phoneNumber ? userModel.phoneNumber : '-',
                  )}
                </Text>
                <Text style={styles.manifest}>
                  {translationString.formatString(
                    translationString.manifest,
                    `#${manifestData.id} ${moment(manifestData.deliveryDate)
                      .format('DDMMYYYY')
                      .toLocaleString()} (${manifestData.batch})`,
                  )}
                </Text>
                <View style={[styles.rowReverse, {marginTop: 30}]}>
                  <TouchableOpacity
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                    }}
                    onPress={handleRefresh}>
                    <Icon
                      name="refresh"
                      size={18}
                      color={'#ffffff'}
                      style={{paddingBottom: 2}}
                    />
                    <Text style={[styles.manifest]}>
                      {translationString.refresh}
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </ImageBackground>
            {!networkModel.isConnected && (
              <View style={styles.offlineContainer}>
                <Image source={OfflineIcon} resizeMode={'contain'} />
                <Text style={styles.offlineLabel}>
                  {translationString.error_poor_network}
                </Text>
              </View>
            )}
          </View>
        )}
      />

      <SafeAreaView>
        <Text style={styles.versionText}>
          Version {DeviceInfo.getVersion()}{' '}
          {Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Uat
            ? 'Trial'
            : Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Staging
            ? 'Staging'
            : Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Stg
            ? 'Staging(HK)'
            : Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.PreProd
            ? 'Pre-Production'
            : 'Production'}
        </Text>
        <Image style={styles.logo} source={KerryLogo} />
      </SafeAreaView>
      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading2}
      />
      <CustomDialogView
        isError={false}
        description={getTotalDownloadedJob()}
        isShow={isShowDialog}
        onLeftClick={() => {
          setIsShowDialog(false);
          // navigation.navigate('RouteSequence');
        }}
        onRightClick={() => {
          setIsShowDialog(false);
          navigation.navigate('PreRouteSequence');
        }}
      />
      <CustomDialogView
        isError={false}
        description={translationString.please_choose}
        isShow={isShowReDialog}
        leftText={translationString.map}
        onLeftClick={async () => {
          setIsShowReDialog(false);
          const REFRESH_TOKEN = await AsyncStorage.getItem(
            Constants.REFRESH_TOKEN,
          );
          const ACCESS_TOKEN = await AsyncStorage.getItem(
            Constants.ACCESS_TOKEN,
          );

          navigation.navigate('webView', {
            REFRESH_TOKEN,
            ACCESS_TOKEN,
            isRefresh: true,
          });
        }}
        rightText={translationString.resort}
        onRightClick={() => {
          setIsShowReDialog(false);
          navigation.navigate('Reorder');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
  },
  backImg: {
    flex: 1,
    backgroundColor: Constants.THEME_COLOR,
    height: (Constants.screenWidth - 40) * 0.646,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  flatlist: {
    flex: 1,
    marginTop: 10,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  item: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C4C4C4',
  },
  icon: {
    marginVertical: 16,
    tintColor: 'black',
  },
  offlineLabel: {
    padding: 16,
    fontSize: Constants.normalFontSize,
    color: 'white',
  },
  itemTitle: {
    padding: 16,
    fontSize: Constants.buttonFontSize,
  },
  username: {
    color: 'white',
    fontFamily: Constants.fontFamily,
    fontSize: 22,
  },
  truckNo: {
    color: 'white',
    fontFamily: Constants.fontFamily,
    fontSize: Constants.buttonFontSize,
    paddingTop: 5,
  },
  manifest: {
    color: 'white',
    fontFamily: Constants.fontFamily,
    fontSize: 18,
    paddingTop: 5,
  },
  versionText: {
    alignSelf: 'center',
    color: 'black',
    fontFamily: Constants.fontFamily,
    fontSize: Constants.buttonFontSize,
    marginBottom: 16,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
});

export default CustomDrawerContent;
