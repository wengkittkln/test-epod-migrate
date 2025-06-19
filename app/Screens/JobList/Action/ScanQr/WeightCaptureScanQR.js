import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RNCamera} from 'react-native-camera';
import {translationString} from '../../../../Assets/translation/Translation';
import {useScanQr} from '../../../../Hooks/JobList/Action/ScanQr/useScanQr';
import * as Constants from '../../../../CommonConfig/Constants';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import LoadingModal from '../../../../Components/LoadingModal';
import ScanIcon from '../../../../Assets/image/icon_photo_frame.png';
import ManualEnterIcon from '../../../../Assets/image/icon_manual_keyboard.png';
import Toast from 'react-native-easy-toast';
import {useFocusEffect} from '@react-navigation/native';

export default ({route, navigation}) => {
  const {cameraRef, handleBack, weightBinOption} = useScanQr(route, navigation);

  const RNCameraProps = {};

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  if (Platform.OS === 'ios') {
    RNCameraProps.onBarCodeRead = ({data}) => {
      console.log('IOS', data);

      const parts = data.split(/[_;]/);

      const skuPart = parts[0];

      let idPart = '';
      if (parts.length > 1) {
        idPart = parts[1];
      }

      navigation.navigate('JobWeightCaptureManualEnter', {
        job: route.params.job,
        sku: skuPart,
        skuId: idPart,
        option: weightBinOption,
      });
    };
  } else {
    RNCameraProps.onGoogleVisionBarcodesDetected = ({barcodes}) => {
      if (barcodes !== undefined && barcodes.length > 0) {
        const response = barcodes[0].data;
        const parts = response.split(/[_;]/);

        const skuPart = parts[0];

        let idPart = '';
        if (parts.length > 1) {
          idPart = parts[1];
        }
        console.log('ANDROID', response);
        navigation.navigate('JobWeightCaptureManualEnter', {
          job: route.params.job,
          sku: skuPart,
          skuId: idPart,
          option: weightBinOption,
        });
      }
    };
  }

  return (
    <SafeAreaView
      style={styles.container}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}>
      <RNCamera
        ref={cameraRef}
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
        onBarCodeRead={(barcodes) => {
          console.log(barcodes);
        }}
        {...RNCameraProps}>
        <View style={{flex: 1}}>
          <View
            style={[
              styles.topContainer,
              {
                width,
              },
              {backgroundColor: Constants.THEME_COLOR},
            ]}>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={handleBack}>
              <Image style={styles.backButton} source={BackButton} />
            </TouchableOpacity>
            <Text style={styles.title}>{translationString.weightCapture}</Text>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={handleBack}>
              <Image
                style={styles.backButton}
                source={ManualEnterIcon}
                height={32}
                width={48}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={ScanIcon} />
          </View>
        </View>
      </RNCamera>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 0,
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backButtonContanier: {
    width: 56,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'center',
  },
  title: {
    flex: 1,
    padding: 15,
    fontSize: 20,
    paddingEnd: 56,
    textAlign: 'center',
    color: Constants.WHITE,
  },
  passwordInputContainer: {
    flex: 1,
    position: 'absolute',
    right: 0,
  },
  passwordInput: {
    right: 0,
    padding: 15,
    fontSize: 20,
    textAlign: 'right',
    color: Constants.WHITE,
  },
  skipScanningContainer: {
    flex: 1,
    position: 'absolute',
    right: 0,
  },
  skipText: {
    right: 0,
    padding: 15,
    fontSize: 20,
    textAlign: 'right',
    color: Constants.WHITE,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {alignSelf: 'center'},
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: Constants.screenWidth - 60,
    marginVertical: hp('15%'),
    height: hp('80%'),
  },
  separator: {
    marginHorizontal: 20,
    marginVertical: 5,
    height: 1,
    backgroundColor: Constants.Pending_Color,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
  },
  modelView: {
    width: Constants.screenWidth - 20,
    backgroundColor: Constants.WHITE,
    alignSelf: 'center',
    borderRadius: 8,
  },
  modelTitle: {
    fontSize: 20,
    alignSelf: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    color: Constants.Dark_Grey,
  },
  divider: {
    marginVertical: 9,
    marginHorizontal: 24,
    backgroundColor: '#00000029',
    height: 1,
  },
  modelText: {
    fontSize: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    color: Constants.Dark_Grey,
  },
  cancelButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Light_Grey,
    borderBottomLeftRadius: 8,
  },
  cancelModelButton: {
    fontSize: 18,
    color: Constants.Dark_Grey,
    alignSelf: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  confirmModalButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Completed_Color,
    borderBottomRightRadius: 8,
  },
  confirmModelButton: {
    fontSize: 18,
    color: Constants.WHITE,
    alignSelf: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: Constants.NoboSansBoldFont,
    borderRadius: 8,
    backgroundColor: Constants.Light_Grey,
    fontSize: Constants.buttonFontSize,
    marginHorizontal: 24,
    marginVertical: 8,
  },
  modelErrorText: {
    fontSize: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    color: 'red',
    marginBottom: 48,
  },
});
