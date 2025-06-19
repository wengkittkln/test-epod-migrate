import {AppRegistry} from 'react-native';
import {startNetworkLogging} from 'react-native-network-logger';

import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

startNetworkLogging();
AppRegistry.registerComponent(appName, () => App);
