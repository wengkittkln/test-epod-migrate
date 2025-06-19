import {Alert, Platform, Linking, PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import * as Constants from '../CommonConfig/Constants';
import TopAIcon from '../Assets/image/icon_top_a.png';
import TopCIcon from '../Assets/image/icon_top_c.png';
import TopDIcon from '../Assets/image/icon_top_d.png';
import FilterAllIcon from '../Assets/image/icon_filter_all.png';
import DeliveryIcon from '../Assets/image/icon_filter_deliver.png';
import PickUpIcon from '../Assets/image/icon_filter_pickup.png';
import {
  check,
  PERMISSIONS,
  RESULTS,
  checkMultiple,
  request,
} from 'react-native-permissions';
import {translationString} from '../Assets/translation/Translation';

export const showAlertMessage = (message, completeHandler) => {
  Alert.alert(
    translationString.alert,
    message,
    [
      {
        text: 'Ok',
        onPress: () => {
          if (completeHandler) {
            completeHandler();
          }
        },
      },
    ],
    {cancelable: false},
  );
};

export const showCustomTitleAlertMessage = (
  title,
  message,
  completeHandler,
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Ok',
        onPress: () => {
          if (completeHandler) {
            completeHandler();
          }
        },
      },
    ],
    {cancelable: false},
  );
};

export const showCameraPermissonAlert = (completeHandler) => {
  showCustomTitleAlertMessage(
    'KOOLPoD',
    translationString.camera_permission,
    () => {
      if (completeHandler) {
        completeHandler();
      }
    },
  );
};

export const checkCameraRollPermission = async () => {
  const androidPermission =
    Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const iosPermission = PERMISSIONS.IOS.PHOTO_LIBRARY;

  const permission = Platform.OS === 'ios' ? iosPermission : androidPermission;

  const hasPermission = await check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await request(permission);
  return status === RESULTS.GRANTED;
};

export const checkLocationPermission = async () => {
  const statuses = await checkMultiple(
    Platform.OS === 'ios'
      ? [PERMISSIONS.IOS.LOCATION_ALWAYS, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
      : Platform.Version >= 29
      ? [
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        ]
      : [
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ],
  );
  if (statuses) {
    if (Platform.OS === 'ios') {
      const locationAlwaysPermisson = statuses[PERMISSIONS.IOS.LOCATION_ALWAYS];
      const locationWhenInUsePermission =
        statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];
      if (
        locationAlwaysPermisson === RESULTS.GRANTED ||
        locationWhenInUsePermission === RESULTS.GRANTED
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      const accessFine = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
      const accessCoarse = statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
      const accessBackground =
        Platform.Version >= 29
          ? statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION]
          : RESULTS.GRANTED;
      if (
        accessFine === RESULTS.GRANTED &&
        accessCoarse === RESULTS.GRANTED &&
        accessBackground === RESULTS.GRANTED
      ) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
};

export const checkCameraPermission = async (
  successCompleteHandler,
  failedCompleteHandler,
) => {
  check(
    Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
  ).then((result) => {
    switch (result) {
      case RESULTS.DENIED:
      case RESULTS.BLOCKED:
      case RESULTS.LIMITED:
        if (failedCompleteHandler) {
          failedCompleteHandler();
        } else {
          showCameraPermissonAlert();
        }
        break;
      case RESULTS.GRANTED:
        if (successCompleteHandler) {
          successCompleteHandler();
        }
        break;
    }
  });
};

export const openSetting = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

export const getCurrentLocationCoordinate = (onSuccess, onError) => {
  Geolocation.getCurrentPosition(
    (position) => {
      onSuccess(position);
    },
    (error) => {
      console.log(error);
      onError(error.code);
    },

    {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
  );
};

export const convertRealmObjectToJSON = (src) => {
  let target = Array.isArray(src) ? [] : {};
  for (let key in src) {
    let v = src[key];
    if (
      key === 'jobs' ||
      key === 'orders' ||
      key === 'orderItems' ||
      key === 'customerSteps' ||
      key === 'reasons' ||
      key === 'actionOrderItem' ||
      key === 'actionAttachment' ||
      key === 'customerConfigurations' ||
      key === 'actionJobBins'
    ) {
      v = Array.from(v);
    }
    if (v) {
      if (typeof v === 'object') {
        target[key] = convertRealmObjectToJSON(v);
      } else {
        target[key] = v;
      }
    } else {
      target[key] = v;
    }
  }

  return target;
};

export const convertRealmObjectToJSONSkipChild = (src, nestedObject) => {
  let target = Array.isArray(src) ? [] : {};
  for (let key in src) {
    let v = src[key];
    if (nestedObject.includes(key)) {
      v = '';
    }
    if (v) {
      if (typeof v === 'object') {
        target[key] = convertRealmObjectToJSONSkipChild(v, nestedObject);
      } else {
        target[key] = v;
      }
    } else {
      target[key] = v;
    }
  }
  return target;
};

export const getFilterIcon = (language, filterType) => {
  switch (filterType) {
    case Constants.JobType.DELIVERY:
      return language === Constants.LanguageType.Chinese
        ? DeliveryIcon
        : TopDIcon;
    case Constants.JobType.PICK_UP:
      return language === Constants.LanguageType.Chinese
        ? PickUpIcon
        : TopCIcon;
    default:
      return language === Constants.LanguageType.Chinese
        ? FilterAllIcon
        : TopAIcon;
  }
};

export const makePhoneCall = (phone) => {
  let phoneNumber = phone;
  if (Platform.OS !== 'android') {
    phoneNumber = `telprompt:${phone}`;
  } else {
    phoneNumber = `tel:${phone}`;
  }
  Linking.canOpenURL(phoneNumber)
    .then((supported) => {
      if (!supported) {
        Alert.alert('Phone number is not available');
      } else {
        return Linking.openURL(phoneNumber);
      }
    })
    .catch((err) => console.log(err));
};
