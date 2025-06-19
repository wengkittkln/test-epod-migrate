import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import LoginScreen from './Screens/Auth/LoginScreen';
import RegisterScreen from './Screens/Auth/RegisterScreen';
import ActivationScreen from './Screens/Auth/ActivationScreen';
import SelectLanguageScreen from './Screens/Language/SelectLanguageScreen';
import NoOrderScreen from './Screens/NoOrder/NoOrderScreen';
import AllJobListScreen from './Screens/JobList/All/AllJobListScreen';
import PendingJobListScreen from './Screens/JobList/Pending/PendingJobListScreen';
import CompletedJobListScreen from './Screens/JobList/Completed/CompletedJobListScreen';
import FailedJobListScreen from './Screens/JobList/Failed/FailedJobListScreen';
import JobDetailScreen from './Screens/JobList/JobDetail/JobDetailScreen';
import SearchJobScreen from './Screens/JobList/Search/SearchJobScreen';
import PreCallActionScreen from './Screens/JobList/Action/PreCall/PreCallActionScreen';
import PodActionScreen from './Screens/JobList/Action/POD/PodActionScreen';
import PocActionScreen from './Screens/JobList/Action/POC/PocActionScreen';
import PartialDeliveryActionScreen from './Screens/JobList/Action/PartialDelivery/PartialDeliveryActionScreen';
import CodActionScreen from './Screens/JobList/Action/COD/CodActionScreen';
import SelectReasonScreen from './Screens/JobList/Action/Reason/SelectReasonScreen';
import EsignScreen from './Screens/JobList/Action/Esign/EsignScreen';
import EsignConfirmScreen from './Screens/JobList/Action/Esign/EsignConfirmScreen';
import TermAndConditionScreen from './Screens/JobList/Action/Esign/TermAndConditionScreen';
import CollectActionScreen from './Screens/JobList/Action/Collect/CollectActionScreen';
import CollectOrderItemListScreen from './Screens/JobList/Action/Collect/CollectOrderItemListScreen';
import ReorderScreen from './Screens/JobList/Reorder/ReorderScreen';
import UserInfoScreen from './Screens/Auth/UserInfoScreen';
import PlateScreen from './Screens/Auth/PlateScreen';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import * as Constants from './CommonConfig/Constants';
import * as RootNavigation from './rootNavigation';
import * as GeneralHelper from './Helper/GeneralHelper';
import {translationString} from './Assets/translation/Translation';
import ScanIcon from './Assets/image/icon_scanqrcode.png';
import SearchIcon from './Assets/image/icon_search.png';
import MenuIcon from './Assets/image/icon_menu.png';
import CustomDrawerContent from './Components/CustomDrawerContent';
import {createAction} from './Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from './Actions/ActionTypes';
import CameraViewScreen from './Screens/Camera/CameraViewScreen';
import SelectPhotoScreen from './Screens/Camera/SelectPhotoScreen';
import {useActionSync} from './Hooks/ActionSync/useActionSync';
import {ActionSyncContext} from './Context/ActionSyncContext';
import NetworkScreen from './Screens/Network';
import {useRefreshTokenLogin} from './Hooks/RefreshTokenLogin/useRefreshTokenLogin';
import ScanQrScreen from './Screens/JobList/Action/ScanQr/ScanQrScreen';
import ScanSkuScreen from './Screens/JobList/Action/ScanQr/ScanSkuScreen';
import ScanSkuItemsScreen from './Screens/JobList/Action/ScanQr/ScanSkuItemsScreen';
import SelfAssignmentScreen from './Screens/JobList/SelfAssignment/SelfAssignmentScreen';
import RemarkScreen from './Screens/JobList/Action/Remark/RemarkScreen';
import {IndexContext} from './Context/IndexContext';
import ScanTrackingNumberScreen from './Screens/JobList/Action/ScanQr/ScanTrackingNumberScreen';
import {MarketPlaceStackNavigator} from './NavigationStacks/MarketPlaceStack';
import ManualInputSkuScreen from './Screens/JobList/Action/ScanQr/ManualInputSkuScreen';
import {JobTransferStackNavigator} from './NavigationStacks/JobTransferStack';
import WebviewScreen from './Screens/Webview/WebviewScreen';
import {useEffect} from 'react';
import BackgroundTimer from 'react-native-background-timer';
import {useNetwork} from './Hooks/Network/useNetwork';
import {useMasterData} from './Hooks/MasterData/useMasterData';
import {useDeltaSync} from './Hooks/DeltaSync/useDeltaSync';
import notifee, {EventType} from '@notifee/react-native';
import QuantityVerifyActionScreen from './Screens/JobList/Action/QuantityVerify/QuantityVerifyActionScreen';
import BatchSelectionJobScreen from './Screens/JobList/BatchSelection/BatchSelectionJobScreen';
import BatchSelectionJobSearchScreen from './Screens/JobList/BatchSelection/BatchSelectionJobSearchScreen';
import BatchSelectionJobScanQR from './Screens/JobList/BatchSelection/BatchSelectionJobScanQR';
import RequestResetPasswordScreen from './Screens/Auth/RequestResetPasswordScreen';
import WeightCaptureScreen from './Screens/FoodWaste/Weighing/WeightCaptureScreen';
import BackButton from './Assets/image/icon_back_white.png';
import ScanQRButton from './Assets/image/icon_scan_qr.png';
import WeightCaptureScanQR from './Screens/JobList/Action/ScanQr/WeightCaptureScanQR';
import JobWeightCaptureManualEnterScreen from './Screens/FoodWaste/Weighing/JobWeightCaptureManualEnterScreen';
import SelectFoodWasteJobScreen from './Screens/FoodWaste/Job/SelectFoodWasteJobScreen';
import FailQRScreen from './Screens/FoodWaste/Fail/FailQRScreen';
import FailureSummaryScreen from './Screens/FoodWaste/Fail/FailureSummaryScreen';
import WeightIcon from './Assets/image/icon_weight.png';
import Logout from './Components/Logout';
import {useLocation} from './Hooks/Location/useLocation';
import * as ManifestRealmManager from './Database/realmManager/ManifestRealmManager';
import JobRequestScreen from './Screens/JobRequest/JobRequestScreen';
import JobRequestScanQRScreen from './Screens/JobRequest/JobRequestScanQRScreen';
import ChatScreen from './Screens/Chat/ChatScreen';
import {WatermarkView} from 'react-native-watermark-component';
import UploadProgressScreen from './Screens/UploadProgressScreen/UploadProgressScreen';

export const Tab = createMaterialTopTabNavigator();
export const AuthStack = createStackNavigator();
export const MainStack = createStackNavigator();
// export const NoOrderStack = createStackNavigator();
export const DrawerStack = createDrawerNavigator();
export const DrawerTopStack = createStackNavigator();
const MarketPlaceStack = createStackNavigator();

export const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="RequestResetPassword"
        component={RequestResetPasswordScreen}
        options={{headerShown: false}}
      />
      <AuthStack.Screen
        name="Language"
        component={SelectLanguageScreen}
        options={{
          headerTitle: translationString.language_selection_title,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
          },
        }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerTitle: translationString.registration,
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
          },
          headerTintColor: Constants.WHITE,
          headerStyle: {
            backgroundColor: Constants.THEME_COLOR,
          },
        }}
      />
      <AuthStack.Screen
        name="Activate"
        component={ActivationScreen}
        options={{headerShown: false}}
      />

      <AuthStack.Screen
        name="UserInfo"
        component={UserInfoScreen}
        options={{
          headerTitle: '',
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
          },
          headerTintColor: Constants.WHITE,
          headerStyle: {
            backgroundColor: Constants.THEME_COLOR,
          },
        }}
      />

      <AuthStack.Screen name="PlateNo" component={PlateScreen} />
    </AuthStack.Navigator>
  );
};

export const DrawerTopStackNavigator = () => {
  const {startActionSync} = useActionSync();
  const {showLoginModal} = useRefreshTokenLogin();
  const userModel = useSelector((state) => state.UserReducer);
  const {enabled: isWaterEnable} = useSelector(
    (state) => state.WatermarkReducer,
  );

  return (
    <WatermarkView
      foreground
      watermark={userModel.username}
      itemWidth={80}
      itemHeight={80}
      rotateZ={-45}
      watermarkTextStyle={{opacity: isWaterEnable ? 0.175 : 0}}>
      <ActionSyncContext.Provider
        value={{
          startActionSync: startActionSync,
          showLoginModal: showLoginModal,
        }}>
        <DrawerTopStack.Navigator mode="modal">
          <DrawerTopStack.Screen
            name="Drawer"
            component={DrawerStackNavigator}
            options={{headerShown: false}}
          />
          <DrawerTopStack.Screen
            name="CollectOrderItemList"
            component={CollectOrderItemListScreen}
            options={{
              animationEnabled: false,
            }}
          />
          <DrawerTopStack.Screen
            options={{headerShown: false}}
            name="MarketPlace"
            component={MarketPlaceStackNavigator}
          />
          <DrawerTopStack.Screen
            name="JobRequest"
            component={JobRequestScreen}
            options={{
              headerTitle: translationString.job_requests,
              headerTitleStyle: {
                fontSize: 20,
                fontFamily: Constants.fontFamily,
                fontWeight: '500',
              },
              headerTintColor: Constants.WHITE,
              headerStyle: {
                backgroundColor: Constants.THEME_COLOR,
              },
              headerBackTitleVisible: false,
            }}
          />
          <DrawerTopStack.Screen
            name="JobRequestScanQR"
            component={JobRequestScanQRScreen}
            options={{
              headerTitle: translationString.job_requests,
              headerTitleStyle: {
                fontSize: 20,
                fontFamily: Constants.fontFamily,
                fontWeight: '500',
              },
              headerTintColor: Constants.WHITE,
              headerStyle: {
                backgroundColor: Constants.THEME_COLOR,
              },
              headerBackTitleVisible: false,
            }}
          />
          <DrawerTopStack.Screen
            options={{headerShown: false}}
            name="JobTransfer"
            component={JobTransferStackNavigator}
          />
        </DrawerTopStack.Navigator>
      </ActionSyncContext.Provider>
    </WatermarkView>
  );
};

export const DrawerStackNavigator = () => {
  const windowWidth = Dimensions.get('screen').width;
  const {startActionSync} = useActionSync();
  const {showLoginModal} = useRefreshTokenLogin();
  return (
    // <ActionSyncContext.Provider
    //   value={{
    //     startActionSync: startActionSync,
    //     showLoginModal: showLoginModal,
    //   }}>
    <DrawerStack.Navigator
      drawerStyle={{
        width: windowWidth - 40,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <DrawerStack.Screen name="Main" component={MainStackNavigator} />
      <DrawerStack.Screen
        name="Language"
        component={SelectLanguageScreen}
        options={{
          headerTitle: translationString.language_selection_title,
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
          },
        }}
      />
    </DrawerStack.Navigator>
    // </ActionSyncContext.Provider>
  );
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        labelStyle: {
          fontSize: 14,
          fontFamily: Constants.fontFamily,
          fontWeight: 'bold',
          textTransform: 'none',
        },
        style: {
          backgroundColor: Constants.THEME_COLOR,
        },
        indicatorStyle: {
          height: 2,
          backgroundColor: 'white',
        },
        activeTintColor: 'white',
        inactiveTintColor: 'rgba(255, 255, 255, 0.8)',
      }}>
      <Tab.Screen
        name="Pending"
        component={PendingJobListScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Tab.Screen
        name="Completed"
        component={CompletedJobListScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Tab.Screen
        name="Failed"
        component={FailedJobListScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Tab.Screen
        name="All"
        component={AllJobListScreen}
        options={{
          animationEnabled: false,
        }}
      />
    </Tab.Navigator>
  );
};

export const MainStackNavigator = (nav) => {
  const {setGPSTracking} = useLocation();
  const joblistModel = useSelector((state) => state.JobListReducer);
  const languageModel = useSelector((state) => state.LanguageReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const dispatch = useDispatch();
  const {
    startActionSync,
    updateActionsSyncLockToPending,
    getAllPendingAction,
    callActionSyncApi,
    updateActionSyncLock,
  } = useActionSync();
  const {showLoginModal} = useRefreshTokenLogin();
  const {auth, authState, manifestData, epodRealm} =
    React.useContext(IndexContext);
  const windowWidth = Dimensions.get('window').width;
  const {networkModel} = useNetwork();
  const {callGetMasterDataApi} = useMasterData();
  const {callGetDeltaSyncApi} = useDeltaSync(callGetMasterDataApi, 'router');
  useEffect(() => {
    notifee.onBackgroundEvent(async ({type, detail}) => {
      if (type === EventType.PRESS && networkModel.isConnected) {
        try {
          updateActionsSyncLockToPending();
          const pendingList = await getAllPendingAction();
          if (pendingList.length > 0) {
            await callActionSyncApi(pendingList);
          }
          updateActionsSyncLockToPending();
          await callGetDeltaSyncApi();
        } catch (error) {
          console.log('Error in onBackgroundEvent:', error.message);
        }
      }
    });

    // Start the background timer
    BackgroundTimer.start();

    const intervalId = BackgroundTimer.setInterval(async () => {
      if (networkModel.isConnected && manifestData.id) {
        try {
          console.log(
            `[Delta Sync] Router scheduled interval initiated. Timestamp: ${new Date().toISOString()}. Interval: 2 minutes.`,
          );

          await callGetDeltaSyncApi();
          const manifestResult =
            await ManifestRealmManager.geManifestByManifestId(
              manifestData,
              epodRealm,
            );

          const manifest = Array.isArray(manifestResult)
            ? manifestResult
            : Array.from(manifestResult || []);

          if (manifest.length > 0 && manifest[0]) {
            const isOwner = manifest[0]?.userId === userModel.id;
            if (!isOwner) {
              const manifestId = manifestData.id;
              await Logout(
                dispatch,
                networkModel,
                authState,
                auth,
                epodRealm,
                callActionSyncApi,
                getAllPendingAction,
                callGetMasterDataApi,
                callGetDeltaSyncApi,
                true,
                updateActionsSyncLockToPending,
                updateActionSyncLock,
                manifestId,
                userModel,
                true,
                setGPSTracking,
              );
            }
          }

          console.log(
            `[Delta Sync] Router scheduled interval Ended. Timestamp: ${new Date().toISOString()}.`,
          );
        } catch (error) {
          console.log('Error calling delta sync:', error.message);
        }
      } else {
        console.log('Network disconnected or missing manifestData.id');
      }
    }, 120000); // 2-minute interval

    return () => {
      BackgroundTimer.clearInterval(intervalId);
      BackgroundTimer.stop(); // Stop the timer in the cleanup function
    };
  }, [manifestData.id, networkModel.isConnected]);

  let style = {
    backgroundColor: Constants.THEME_COLOR,
    shadowColor: 'transparent',
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
    elevation: 0,
  };
  // if (Platform.OS === 'ios') {
  //   style = {...style, width: windowWidth};
  // }

  return (
    // <ActionSyncContext.Provider
    //   value={{
    //     startActionSync: startActionSync,
    //     showLoginModal: showLoginModal,
    //   }}>

    <MainStack.Navigator
      initialRouteName={manifestData && manifestData.id ? 'MainTab' : 'NoOrder'}
      screenOptions={{
        headerStyle: style,
        headerTitle: translationString.job_list_title,
        headerTitleStyle: {
          color: 'white',
          fontSize: 20,
          fontFamily: Constants.fontFamily,
          fontWeight: '500',
        },
        headerTitleAlign: 'left',
        headerLeft: () => (
          <TouchableOpacity
            style={{marginLeft: 16, height: 24}}
            onPress={() => {
              nav.navigation.openDrawer();
            }}>
            <Image source={MenuIcon} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View
            style={{
              flexDirection: 'row',
              margin: 16,
              alignItems: 'center',
            }}>
            <Pressable
              style={{height: 24}}
              onPress={() => {
                let payload = {
                  isShowFilterModal: true,
                };
                dispatch(
                  createAction(ActionType.SET_IS_SHOW_FILTER_MODAL, payload),
                );
              }}>
              <Image
                source={GeneralHelper.getFilterIcon(
                  languageModel.id,
                  joblistModel.filterType,
                )}
              />
            </Pressable>
            <Pressable
              style={{marginLeft: 16, height: 24}}
              onPress={() => {
                RootNavigation.navigate('JobWeightCaptureManualEnter', {
                  option: 'batch',
                });
              }}>
              <Image source={WeightIcon} style={styles.weightIcon} />
            </Pressable>
            <Pressable
              style={{marginLeft: 16, height: 24}}
              onPress={() => {
                RootNavigation.navigate('SearchJob');
              }}>
              <Image source={SearchIcon} />
            </Pressable>
            <Pressable
              style={{marginLeft: 16, height: 24}}
              onPress={() => {
                RootNavigation.navigate('ScanQr');
              }}>
              <Image source={ScanIcon} />
            </Pressable>
          </View>
        ),
      }}>
      <MainStack.Screen name="MainTab" component={MainTabNavigator} />
      <MainStack.Screen
        name="Network"
        component={NetworkScreen}
        options={{
          headerTitle: 'Debugger',
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={{marginLeft: 16, height: 24}}
                onPress={() => {
                  nav.navigation.goBack();
                }}>
                <Image source={MenuIcon} />
              </TouchableOpacity>
            );
          },
          headerRight: null,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="SearchJob"
        component={SearchJobScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PreCallAction"
        component={PreCallActionScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PodAction"
        component={PodActionScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PocAction"
        component={PocActionScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="SelectReason"
        component={SelectReasonScreen}
        options={{animationEnabled: false}}
      />
      <MainStack.Screen
        name="PhotoFlowCamera"
        component={CameraViewScreen}
        options={{headerShown: false, animationEnabled: false}}
      />
      <MainStack.Screen
        name="ScanSku"
        component={ScanSkuScreen}
        options={{headerShown: false}}
      />
      <MainStack.Screen name="ScanSkuItems" component={ScanSkuItemsScreen} />
      <MainStack.Screen
        name="ManualInputSku"
        component={ManualInputSkuScreen}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name="PhotoFlowSelectPhoto"
        component={SelectPhotoScreen}
        options={{
          headerTitle: translationString.select_photo_title,
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
          },
          headerTintColor: Constants.WHITE,
          headerStyle: {
            backgroundColor: Constants.THEME_COLOR,
          },
        }}
      />
      <MainStack.Screen
        name="Camera"
        component={CameraViewScreen}
        options={{headerShown: false, animationEnabled: false}}
      />
      <MainStack.Screen
        name="SelectPhoto"
        component={SelectPhotoScreen}
        options={{
          headerTitle: translationString.select_photo_title,
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
          },
          headerTintColor: Constants.WHITE,
          headerStyle: {
            backgroundColor: Constants.THEME_COLOR,
          },
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="GeneralCallReason"
        component={SelectReasonScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PhotoReason"
        component={SelectReasonScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PartialDeliveryReason"
        component={SelectReasonScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PodReason"
        component={SelectReasonScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PocReason"
        component={SelectReasonScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="CodReason"
        component={SelectReasonScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="PartialDeliveryAction"
        component={PartialDeliveryActionScreen}
        options={{
          headerTitle: translationString.confirm_partial_delivery_amount,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="CodAction"
        component={CodActionScreen}
        options={{
          headerTitle: translationString.confirm_cod,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="Esign"
        component={EsignScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="EsignConfirm"
        component={EsignConfirmScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="TermNCondition"
        component={TermAndConditionScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="Language"
        component={SelectLanguageScreen}
        options={{
          headerTitle: translationString.language_selection_title,
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
            color: Constants.WHITE,
          },
          headerRight: null,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="CollectAction"
        component={CollectActionScreen}
        options={{animationEnabled: false}}
      />
      <MainStack.Screen
        name="NoOrder"
        component={NoOrderScreen}
        options={{
          headerStyle: {
            backgroundColor: 'white',
            shadowColor: 'transparent',
            shadowRadius: 0,
            shadowOffset: {
              height: 0,
            },
            elevation: 0,
          },
          headerTitle: '',
          headerLeft: null,
        }}
      />
      <MainStack.Screen
        name="ScanQr"
        component={ScanQrScreen}
        options={{headerShown: false, animationEnabled: false}}
      />
      <MainStack.Screen
        name="Reorder"
        component={ReorderScreen}
        options={{headerShown: true, animationEnabled: false}}
      />
      <MainStack.Screen
        name="RouteSequence"
        component={ReorderScreen}
        options={{headerShown: true, animationEnabled: false}}
      />
      <MainStack.Screen
        name="PreRouteSequence"
        component={ReorderScreen}
        options={{headerShown: true, animationEnabled: false}}
      />
      {/* <MainStack.Screen
        name="ScanTrackingNumber"
        component={ScanTrackingNumberScreen}
        options={{headerShown: false}}
      /> */}
      <MainStack.Screen
        name="SelfAssignment"
        component={SelfAssignmentScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="webView"
        component={WebviewScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="exportPhoto"
        component={SelectPhotoScreen}
        options={{
          headerTitle: translationString.export_photo,
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: Constants.fontFamily,
            fontWeight: '500',
          },
          headerTintColor: Constants.WHITE,
          headerStyle: {
            backgroundColor: Constants.THEME_COLOR,
          },
        }}
      />
      <MainStack.Screen
        name="VerifyQty"
        component={QuantityVerifyActionScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="BatchSelection"
        component={BatchSelectionJobScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="BatchSelectionSearch"
        component={BatchSelectionJobSearchScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="BatchSelectionJobScanQR"
        component={BatchSelectionJobScanQR}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="BarcodePODSelectReason"
        component={SelectReasonScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <MainStack.Screen name="RemarkScreen" component={RemarkScreen} />
      <MainStack.Screen
        name="WeightCapture"
        component={WeightCaptureScreen}
        options={{
          headerTitle: translationString.weightCapture,
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={{marginLeft: 16, height: 24}}
                onPress={() => {
                  nav.navigation.goBack();
                }}>
                <Image source={BackButton} />
              </TouchableOpacity>
            );
          },
          headerRight: null,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="SelectFoodWasteJobScreen"
        component={SelectFoodWasteJobScreen}
        options={{
          headerTitle: translationString.selectJobToUpdate,
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={{marginLeft: 16, height: 24}}
                onPress={() => {
                  nav.navigation.goBack();
                }}>
                <Image source={BackButton} />
              </TouchableOpacity>
            );
          },
          headerRight: null,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="FailQRScreen"
        component={FailQRScreen}
        options={{
          headerTitle: translationString.failureQR,
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={{marginLeft: 16, height: 24}}
                onPress={() => {
                  nav.navigation.goBack();
                }}>
                <Image source={BackButton} />
              </TouchableOpacity>
            );
          },
          headerRight: null,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="FailureSummaryScreen"
        component={FailureSummaryScreen}
        options={{
          headerTitle: translationString.failureSummary,
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={{marginLeft: 16, height: 24}}
                onPress={() => {
                  nav.navigation.goBack();
                }}>
                <Image source={BackButton} />
              </TouchableOpacity>
            );
          },
          headerRight: null,
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="WeightCaptureScanQR"
        component={WeightCaptureScanQR}
        options={{headerShown: false, animationEnabled: false}}
      />
      <MainStack.Screen
        name="JobWeightCaptureManualEnter"
        component={JobWeightCaptureManualEnterScreen}
      />
      <MainStack.Screen
        name="UploadProgressScreen"
        component={UploadProgressScreen}
        options={{
          headerShown: false, // Assuming UploadProgressScreen has its own header
          animationEnabled: false,
        }}
      />
      <MainStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={{marginLeft: 16, height: 24}}
                onPress={() => {
                  nav.navigation.goBack();
                }}>
                <Image source={BackButton} />
              </TouchableOpacity>
            );
          },
          headerRight: null,
          animationEnabled: false,
        }}
      />
    </MainStack.Navigator>

    // </ActionSyncContext.Provider>
  );
};

const styles = StyleSheet.create({
  weightIcon: {
    height: 22,
    width: 22,
    tintColor: Constants.WHITE,
  },
});
