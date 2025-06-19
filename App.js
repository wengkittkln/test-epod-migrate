/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Button,
  Text,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {Provider} from 'react-redux';
import store from './app/Reducers/index';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  AuthStackNavigator,
  NoOrderStackNavigator,
  DrawerTopStackNavigator,
} from './app/router';
import {navigationRef} from './app/rootNavigation';
import {IndexContext} from './app/Context/IndexContext';
import {AppProvider} from './app/Context/AppContext';

import {useAuth} from './app/Hooks/Auth/useAuth';
import {useEpodRealm} from './app/Hooks/EpodRealm/useEpodRealm';
import SplashScreen from './app/Screens/SplashScreen/SplashScreen';
import analytics from '@react-native-firebase/analytics';
import {usePushNotification} from './app/Hooks/PushNotification/usePushNotification';
import PlateScreen from './app/Screens/Auth/PlateScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Linking} from 'react-native';
import {useFirebaseConfig} from './app/Hooks/Auth/useFirebaseConfig';
import * as Constants from './app/CommonConfig/Constants';
import JailMonkey from 'jail-monkey';
import * as GeneralHelper from './app/Helper/GeneralHelper';
import {AppState, BackHandler} from 'react-native';
import {translationString} from './app/Assets/translation/Translation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNExitApp from 'react-native-exit-app';
import Toast, {ErrorToast, SuccessToast} from 'react-native-toast-message';
import notifee from '@notifee/react-native';
import JobRequestHandler from './app/Components/JobRequestHandler/JobRequestHandler';

const RootStack = createStackNavigator();
const PERSISTENCE_KEY = 'NAVIGATION_STATE';

const App = () => {
  const {} = useFirebaseConfig();
  const {epodRealm, EpodRealmHelper, manifestData, masterData, getUUId} =
    useEpodRealm();
  const {auth, authState, noOrderMsg} = useAuth(
    manifestData,
    epodRealm.current,
    EpodRealmHelper,
  );

  const {deviceToken} = usePushNotification();
  const routeNameRef = React.useRef();

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();
  const [call, setCall] = useState(0);
  let realmObject = useRef();

  const checkRootedDevice = () => {
    console.log('Checking Root');
    if (JailMonkey.isJailBroken()) {
      console.log('Device Has Been Rooted!');
      AppState.removeEventListener('change', handleAppStateChange);
      auth.logout();
      GeneralHelper.showAlertMessage(translationString.device_rooted, () => {
        if (Platform.OS === 'ios') {
          RNExitApp.exitApp();
        } else {
          BackHandler.exitApp();
        }
      });
    }
  };

  const checkLocationPermission = async () => {
    const response = await GeneralHelper.checkLocationPermission();
    if (!response) {
      GeneralHelper.showAlertMessage(
        translationString.permission_location_rationale,
        async () => {
          if (Platform.OS === 'ios') {
            const respAlways = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
            if (respAlways !== RESULTS.GRANTED) {
              GeneralHelper.openSetting();
            }
          } else {
            const respFine = await request(
              PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            );
            let respBackground = RESULTS.GRANTED;
            if (Platform.Version >= 29) {
              respBackground = await request(
                PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
              );
            }
            if (
              respFine !== RESULTS.GRANTED ||
              respBackground !== RESULTS.GRANTED
            ) {
              GeneralHelper.openSetting();
            }
          }
        },
      );
    }
  };

  const handleAppStateChange = async (nextAppState) => {
    if (nextAppState === 'active') {
      checkRootedDevice();
      const loggedIn = await AsyncStorage.getItem(Constants.IS_LOGGED_IN);
      if (loggedIn === 'true') {
        checkLocationPermission();
      }
    }
  };

  const hasAndroidWritePermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  };

  useEffect(() => {
    async function RequestNotifeePermission() {
      await notifee.requestPermission();
      await hasAndroidWritePermission();
    }
    RequestNotifeePermission();
    AppState.addEventListener('change', handleAppStateChange);
  }, []);

  React.useEffect(() => {
    const restoreState = async () => {
      if (epodRealm?.current === undefined) {
        const realmObjectValue = await getUUId();
        if (realmObjectValue) {
          epodRealm.current = realmObjectValue;
          return;
        }
      }
      let callValue = call;
      if (call === 10000) {
        callValue = 0;
      }
      setCall(callValue + 1); //dirty way to do call self
    };

    restoreState();
  }, [call]);

  React.useEffect(() => {
    if (epodRealm?.current !== undefined) {
      realmObject.current = epodRealm.current;
    }
    const restoreState = async () => {
      if (!epodRealm?.current || !realmObject?.current) {
        return;
      }
      try {
        const initialUrl = await Linking.getInitialURL();
        // while (epodRealm === undefined || epodRealm.current === undefined) {
        //   const realmObjectValue = await getUUId();
        //   realmObject.current = realmObjectValue;
        // }
        if (Platform.OS !== 'web' && initialUrl == null) {
          // Only restore state if there's no deep link and we're not on web
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString
            ? JSON.parse(savedStateString)
            : undefined;
          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };
    if (!isReady) {
      restoreState();
    }
  }, [isReady, epodRealm?.current, realmObject?.current]);

  if (
    !isReady ||
    authState.isSplashScreen === null ||
    epodRealm === undefined
  ) {
    return null;
  }

  function renderStack() {
    let noOrder = true;
    // manifest data default set to {} === manifest data cannot be null
    if (manifestData && manifestData.id) {
      noOrder = false;
    }
    AsyncStorage.getItem(Constants.ACCESS_TOKEN).then((res) => {
      if (!res) {
        return (
          <RootStack.Screen
            name={'Auth'}
            component={AuthStackNavigator}
            options={{headerShown: false}}
          />
        );
      }
    });
    if (authState.isSplashScreen) {
      return (
        <RootStack.Screen
          name={'Splash'}
          component={SplashScreen}
          options={{headerShown: false}}
        />
      );
    } else if (authState.isLogin) {
      if (!noOrder && authState.isNoPlateNum) {
        return <RootStack.Screen name={'PlateNo'} component={PlateScreen} />;
      } else if (noOrder) {
        return (
          <RootStack.Screen
            name={'NoOrder'}
            component={DrawerTopStackNavigator}
            options={{headerShown: false}}
          />
        );
      } else {
        return (
          <RootStack.Screen
            name={'Main'}
            component={DrawerTopStackNavigator}
            options={{headerShown: false}}
          />
        );
      }
    } else {
      // return null;
      return (
        <RootStack.Screen
          name={'Auth'}
          component={AuthStackNavigator}
          options={{headerShown: false}}
        />
      );
    }
  }

  const toastConfig = {
    multiLineSuccess: ({text1, text2, position, props}) => (
      <SuccessToast
        text1={text1}
        text1NumberOfLines={props.text1NumberOfLines}
        text2={text2}
        text2NumberOfLines={props.text2NumberOfLines}
      />
    ),
    multiLineError: ({text1, text2, position, props}) => (
      <ErrorToast
        text1={text1}
        text1NumberOfLines={props.text1NumberOfLines}
        text2={text2}
        text2NumberOfLines={props.text2NumberOfLines}
      />
    ),
  };

  return (
    <Provider store={store}>
      <AppProvider>
        <IndexContext.Provider
          value={{
            auth: auth,
            authState: authState,
            noOrderMsg: noOrderMsg,
            epodRealm: realmObject.current,
            EpodRealmHelper: EpodRealmHelper,
            manifestData: manifestData,
            masterData: masterData,
          }}>
          <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
            onStateChange={(state) => {
              const currentRouteName =
                navigationRef.current.getCurrentRoute().name;
              routeNameRef.current = currentRouteName;
              analytics().logScreenView({
                screen_name: currentRouteName,
                screen_class: currentRouteName,
              });
              AsyncStorage.setItem(
                PERSISTENCE_KEY,
                JSON.stringify(state),
              ).catch((err) => {
                console.log('Error saving navigation state:', err);
              });
            }}>
            <RootStack.Navigator>{renderStack()}</RootStack.Navigator>
          </NavigationContainer>
          <JobRequestHandler />
        </IndexContext.Provider>
      </AppProvider>
      <Toast config={toastConfig} position="bottom" />
    </Provider>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
