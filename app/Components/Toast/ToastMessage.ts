import React from 'react';
import Toast, {ToastPosition} from 'react-native-toast-message';

export class ToastBody {
  text1: string;
  text2?: string;
  position?: ToastPosition = 'bottom'; //Tempory hardcoded at App.js to bottom
  duration? = 2000;
  autoHide? = true;
  text1NumberOfLines? = 1;
  text2NumberOfLines?: number;
}

export const ToastMessageMultiLine = (message: ToastBody) => {
  Toast.show({
    type: 'multiLineSuccess',
    text1: message.text1,
    text2: message.text2,
    props: {
      text1NumberOfLines: message.text1NumberOfLines,
    },
  });
};

export const ToastMessageErrorMultiLine = (message: ToastBody) => {
  Toast.show({
    type: 'multiLineError',
    text1: message.text1,
    text2: message.text2,
    props: {
      text1NumberOfLines: message.text1NumberOfLines,
    },
  });
};

export const ToastMessage = (message: ToastBody) => {
  Toast.show({
    position: message.position,
    type: 'multiLineSuccess',
    text1: message.text1,
    text2: message.text2,
    autoHide: message.autoHide,
    visibilityTime: message.duration
  });
};

export const ToastMessageError = (message: ToastBody) => {
  Toast.show({
    position: message.position,
    type: 'error',
    text1: message.text1,
    text2: message.text2,
    autoHide: message.autoHide,
    visibilityTime: message.duration,
  });
};
