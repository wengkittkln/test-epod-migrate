import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {ImageRes} from '../../Assets';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';

export const JobRequestScanQRScreen = ({navigation}) => {
  const RNCameraProps = {};
  const [width, setWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (Platform.OS === 'ios') {
    RNCameraProps.onBarCodeRead = ({data}) => {
      if (isLoading) return;
      setIsLoading(true);
      navigation.navigate('JobRequest', {scannedQRCode: data});
      setIsLoading(false);
    };
  } else {
    RNCameraProps.onGoogleVisionBarcodesDetected = ({barcodes}) => {
      if (barcodes !== undefined && barcodes.length > 0) {
        if (isLoading) return;
        setIsLoading(true);
        const response = barcodes[0].data;
        navigation.navigate('JobRequest', {scannedQRCode: response});
        setIsLoading(false);
      }
    };
  }

  return (
    <SafeAreaView
      style={{flex: 1}}
      onLayout={(e) => {
        const {width} = e.nativeEvent.layout;
        setWidth(width);
      }}>
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
        // onBarCodeRead={(barcodes) => {
        //     addBarcode(barcodes.data)
        // }}
        {...RNCameraProps}>
        <View style={{flex: 1}}>
          <View
            style={[
              styles.topContainer,
              {
                width,
              },
            ]}>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={() => navigation.pop()}>
              <Image style={styles.backButton} source={ImageRes.BackButton} />
            </TouchableOpacity>
            <Text style={styles.title}>{translationString.scan}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={ImageRes.SanQRFrame} />
          </View>
        </View>
      </RNCamera>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default JobRequestScanQRScreen;
