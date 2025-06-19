import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {translationString} from '../../Assets/translation/Translation';
import {useActivate} from '../../Hooks/Auth/useActivate';
import * as Constants from '../../CommonConfig/Constants';
import BackButton from '../../Assets/image/icon_back_white.png';
import LoadingModal from '../../Components/LoadingModal';
import ScanIcon from '../../Assets/image/icon_photo_frame.png';
import CustomAlertView from '../../Components/CustomAlertView';
import {useFocusEffect} from '@react-navigation/native';

export default ({route, navigation}) => {
  const {
    alertMsg,
    cameraRef,
    isShowLoadingIndicator,
    handleBack,
    handleQrCode,
  } = useActivate(route, navigation);

  return (
    <SafeAreaView style={styles.container}>
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
          handleQrCode(barcodes.data);
        }}>
        <View style={{flex: 1}}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={handleBack}>
              <Image style={styles.backButton} source={BackButton} />
            </TouchableOpacity>
            <Text style={styles.title}>{translationString.register}</Text>
          </View>

          <View style={styles.imageContainer}>
            <Image style={styles.image} source={ScanIcon} />
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.messageTextContainer}>
              <Text style={styles.messageText}>
                {translationString.activation_scan}
              </Text>
            </View>
          </View>
        </View>
      </RNCamera>

      <LoadingModal
        isShowLoginModal={isShowLoadingIndicator}
        message={translationString.searching}
      />

      {alertMsg !== '' && <CustomAlertView alertMsg={alertMsg} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 0,
    width: Constants.screenWidth,
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
  messageTextContainer: {
    padding: 8,
    flex: 1,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  messageText: {
    textAlign: 'center',
    color: Constants.WHITE,
  },
  backButtonContanier: {
    width: 56,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'center',
  },
  bottomContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    padding: 15,
    fontSize: 20,
    paddingEnd: 56,
    textAlign: 'center',
    color: Constants.WHITE,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {alignSelf: 'center'},
});
