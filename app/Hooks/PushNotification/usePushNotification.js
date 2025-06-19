import React, {useEffect, useState} from 'react';
import {Platform, Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

export const usePushNotification = () => {
  const [deviceToken, setDeviceToken] = useState('');

  //Firebase Notification
  async function registerAppWithFCM() {
    await messaging().registerDeviceForRemoteMessages();
  }

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const getFcmToken = () =>
    messaging()
      .getToken()
      .then((token) => {
        setDeviceToken(token);
      });

  const refreshFcmToken = () => {
    messaging().onTokenRefresh((token) => {
      setDeviceToken(token);
    });
  };

  useEffect(() => {
    requestUserPermission();
    registerAppWithFCM();
    getFcmToken();
    refreshFcmToken();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return {deviceToken};
};
