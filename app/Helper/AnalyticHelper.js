import analytics from '@react-native-firebase/analytics';

const addEventLog = (eventName, param) => {
  analytics().logEvent(eventName, param);
};

export {addEventLog};
