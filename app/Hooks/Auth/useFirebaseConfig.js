import React, {useEffect} from 'react';
import {BackHandler, Platform, Alert, Linking} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';
import remoteConfig from '@react-native-firebase/remote-config';
import DeviceInfo from 'react-native-device-info';
import RNExitApp from 'react-native-exit-app';

export const useFirebaseConfig = () => {
  const fetchFirebaseRemoteConfig = () => {
    //for dev use 0 for testing
    let minCacheInterval = 0; //3600
    const config = remoteConfig();
    config.setDefaults({
      app_version: '3.0.0',
      force_update_enabled: false,
      update_message: '有新版本可以更新，您想更新嗎?',
      force_update_message: '在您能夠使用該應用程序之前，需要更新新版本.',
    });

    config
      .fetch(minCacheInterval)
      .then(() => remoteConfig().fetchAndActivate())
      .then(() => remoteConfig().getAll())
      .then((res) => {
        const appVersion = res.app_version.asString();
        const isForceUpdate = res.force_update_enabled.asBoolean();
        const url = res.url.asString();

        let isLatestVersion = compareAppVersion(
          DeviceInfo.getVersion(),
          appVersion, 
        );

        // Output:
        // 0: a = b
        // 1: a > b
        // -1: a < b
        if (isLatestVersion === -1) {
          if (isForceUpdate) {
            Alert.alert(
              translationString.alert,
              translationString.forceUpdateMessage,
              [
                {
                  text: translationString.okText,
                  onPress: () => {
                    directToAppLocation(url);
                  },
                },
              ],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              translationString.alert,
              translationString.updateMessage,
              [
                {
                  text: translationString.cancel,
                  onPress: () => {},
                },
                {
                  text: translationString.okText,
                  onPress: () => {
                    directToAppLocation(url);
                  },
                },
              ],
              {cancelable: false},
            );
          }
        }
      });
  };

  const directToAppLocation = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        if (Platform.OS === 'ios') {
          Linking.openURL(url).then(() => {
            RNExitApp.exitApp();
            //NativeModules.RestartModule.KillApp();
          });
        } else {
          BackHandler.exitApp();
          Linking.openURL(url);
        }
      }
    });
  };

  const compareAppVersion = (currentVer, latestVersion) => {
    //treat non-numerical characters as lower version
    //replacing them with a negative number based on charcode of each character
    function fix(s) {
      return '.' + (s.toLowerCase().charCodeAt(0) - 2147483647) + '.';
    }
    currentVer = ('' + currentVer).replace(/[^0-9\.]/g, fix).split('.');
    latestVersion = ('' + latestVersion).replace(/[^0-9\.]/g, fix).split('.');
    var c = Math.max(currentVer.length, latestVersion.length);
    for (var i = 0; i < c; i++) {
      //convert to integer the most efficient way
      currentVer[i] = ~~currentVer[i];
      latestVersion[i] = ~~latestVersion[i];
      if (currentVer[i] > latestVersion[i]) return 1;
      else if (currentVer[i] < latestVersion[i]) return -1;
    }
    return 0;
  };

  useEffect(() => {
    fetchFirebaseRemoteConfig();
  }, []);

  return {};
};
