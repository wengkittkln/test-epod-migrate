import Realm from 'realm';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';

export const DeviceSchema = {
  name: Constants.CALL_LOG_SCHEMA,
  properties: {
    DeviceId: {
      type: 'string?',
      default: null,
    },
    RegistrationId: {
      type: 'string?',
      default: null,
    },
    GuiVersion: {
      type: 'string',
      default: DeviceInfo.getVersion(),
    },
    DeviceType: {
      type: 'int',
      default: Platform.OS === 'ios' ? 1 : 2,
    },
  },
};
