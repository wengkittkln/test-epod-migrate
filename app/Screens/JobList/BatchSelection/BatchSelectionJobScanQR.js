import React, {useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import {RNCamera, RNCameraProps} from 'react-native-camera';
import {translationString} from '../../../Assets/translation/Translation';
import * as Constants from '../../../CommonConfig/Constants';
import Modal from 'react-native-modal';
import {useBatchSelectionJobScanQR} from './../../../Hooks/JobList/BatchSelection/useBatchSelectionJobScanQR';
import BackButton from '../../../Assets/image/icon_back_white.png';
import SanQRFrame from '../../../Assets/image/icon_photo_frame.png';

export default ({route, navigation}) => {
  const {isLoading, fadeAnim, addBarcode, onConfirm, getSelectedCount, onBack} =
    useBatchSelectionJobScanQR(route, navigation);

  const RNCameraProps = {};
  const [width, setWidth] = useState(0);

  if (Platform.OS === 'ios') {
    RNCameraProps.onBarCodeRead = ({data}) => {
      addBarcode(data);
    };
  } else {
    RNCameraProps.onGoogleVisionBarcodesDetected = ({barcodes}) => {
      if (barcodes !== undefined && barcodes.length > 0) {
        const response = barcodes[0].data;
        addBarcode(response);
      }
    };
  }

  return (
    <SafeAreaView
      style={{flex: 1}}
      onLayout={(e) => {
        const {_width, _height} = e.nativeEvent.layout;
        setWidth(_width);
      }}>
      <Modal isVisible={isLoading} coverScreen={true}>
        <ActivityIndicator color={Constants.THEME_COLOR} />
      </Modal>
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
          },
          styles.aniamtionFlash,
        ]}
      />
      <RNCamera
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        playSoundOnCapture={false}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        {...RNCameraProps}>
        <View style={{flex: 1}}>
          <View
            style={[
              styles.topContainer,
              {
                width: width,
              },
            ]}>
            <Text style={styles.title}>{translationString.scan}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={SanQRFrame} />
          </View>
        </View>
      </RNCamera>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          onConfirm();
        }}>
        <Text style={styles.confirmText}>{getSelectedCount()}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    flex: 1,
    padding: 15,
    fontSize: 20,
    paddingEnd: 56,
    textAlign: 'center',
    color: Constants.WHITE,
  },
  backButton: {
    alignSelf: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {alignSelf: 'center'},
  topContainer: {
    flex: 0,
    width: Constants.screenWidth,
    flexDirection: 'row',
  },
  backButtonContanier: {
    width: 56,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
  aniamtionFlash: {
    bottom: 56,
    zIndex: 0.5,
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
});
