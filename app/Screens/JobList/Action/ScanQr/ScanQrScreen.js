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
import Toast from 'react-native-easy-toast';
import {useFocusEffect} from '@react-navigation/native';

export default ({route, navigation}) => {
  const {
    cameraRef,
    isShowLoadingIndicator,
    stepCode,
    isShowPasswordInputModal,
    password,
    passwordError,
    isPasswordChecking,
    scanQrResult,
    isShowSkipQR,
    isExtraStep,
    isError,
    cancelButtonOnPress,
    confirmButtonOnPress,
    textOnChange,
    handleBack,
    handleQrCode,
    handlePasswordInput,
    setScanQrResult,
    confirmSkipScanQR,
    setIsShowSkipQR,
  } = useScanQr(route, navigation);
  const job = route.params?.job ? route.params.job : null;

  const RNCameraProps = {};

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  if (Platform.OS === 'ios') {
    RNCameraProps.onBarCodeRead = ({data}) => {
      handleQrCode(data);
      console.log('IOS', data);
    };
  } else {
    RNCameraProps.onGoogleVisionBarcodesDetected = ({barcodes}) => {
      if (barcodes !== undefined && barcodes.length > 0) {
        const response = barcodes[0].data;
        console.log('Android', response);
        handleQrCode(response);
      }
    };
  }

  const renderSkipPassword = () => {
    if (
      (stepCode === Constants.StepCode.BARCODE_POD ||
        stepCode === Constants.StepCode.BARCODEESIGN_POD ||
        stepCode === Constants.StepCode.ESIGNBARCODE_POD) &&
      job &&
      job.jobPassword
    ) {
      return (
        <TouchableOpacity
          style={styles.passwordInputContainer}
          onPress={handlePasswordInput}>
          <Text style={styles.passwordInput}>
            {translationString.password_input}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  const renderSkipSkuModal = () => {
    return (
      <Modal animationType="fade" transparent={true} visible={isShowSkipQR}>
        <View style={styles.darkBackground}>
          <View style={styles.modelView}>
            <Text style={styles.modelTitle}>
              {translationString.password_input}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.modelText}>
              {translationString.enterSeriesNumber}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isError ? 'red' : 'black',
                  borderColor: isError ? 'red' : 'transparent',
                },
              ]}
              onChangeText={(text) => {
                setScanQrResult(text);
              }}
              value={scanQrResult}
              autoCapitalize={'none'}
              autoFocus={true}
            />
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                underlayColor={Constants.Light_Grey_Underlay}
                style={styles.cancelButtonContainer}
                onPress={() => {
                  setIsShowSkipQR(false);
                }}>
                <Text style={styles.cancelModelButton}>
                  {translationString.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                underlayColor={Constants.Green_Underlay}
                style={styles.confirmModalButtonContainer}
                onPress={() => confirmSkipScanQR(scanQrResult)}>
                <Text style={styles.confirmModelButton}>
                  {translationString.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
        // onBarCodeRead={(barcodes) => {
        //   handleQrCode(barcodes.data);
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
              onPress={handleBack}>
              <Image style={styles.backButton} source={BackButton} />
            </TouchableOpacity>
            <Text style={styles.title}>{translationString.scan}</Text>
            {renderSkipPassword()}
            {isExtraStep && (
              <TouchableOpacity
                style={styles.skipScanningContainer}
                onPress={() => {
                  setIsShowSkipQR(true);
                }}>
                <Text style={styles.skipText}>{translationString.skip}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={ScanIcon} />
          </View>
        </View>
      </RNCamera>

      <LoadingModal
        isShowLoginModal={isShowLoadingIndicator}
        message={translationString.searching}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={isShowPasswordInputModal}>
        <View style={styles.darkBackground}>
          <View style={styles.modelView}>
            <Text style={styles.modelTitle}>
              {translationString.password_input}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.modelText}>
              {translationString.please_input_password}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: passwordError != '' ? 'red' : 'black',
                  borderColor: passwordError != '' ? 'red' : 'transparent',
                },
              ]}
              onChangeText={(text) => textOnChange(text)}
              value={password}
              autoCapitalize={'none'}
            />
            <Text style={styles.modelErrorText}>{passwordError}</Text>
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                underlayColor={Constants.Light_Grey_Underlay}
                style={styles.cancelButtonContainer}
                onPress={cancelButtonOnPress}>
                <Text style={styles.cancelModelButton}>
                  {translationString.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                underlayColor={Constants.Green_Underlay}
                style={styles.confirmModalButtonContainer}
                onPress={confirmButtonOnPress}>
                <Text style={styles.confirmModelButton}>
                  {translationString.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {renderSkipSkuModal()}
      <LoadingModal
        isShowLoginModal={isPasswordChecking}
        message={translationString.loading}
      />
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
