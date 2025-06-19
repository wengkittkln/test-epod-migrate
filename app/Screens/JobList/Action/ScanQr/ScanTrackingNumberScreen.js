import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {RNCamera} from 'react-native-camera';
import {translationString} from '../../../../Assets/translation/Translation';
import * as Constants from '../../../../CommonConfig/Constants';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import ScanIcon from '../../../../Assets/image/icon_photo_frame.png';
import {useScanTranckingNumber} from '../../../../Hooks/JobList/Action/ScanQr/useScanTrackingNumber';
import {useFocusEffect} from '@react-navigation/native';

export default ({route, navigation}) => {
  const {
    cameraRef,
    jobTransferModel,
    // isBarcodeScannerEnabled,
    isShowLoadingIndicator,
    handleBack,
    handleQrCode,
    confirmButtonOnPressed,
  } = useScanTranckingNumber(route, navigation);
  let isBarcodeScannerEnabled = true;

  const RNCameraProps = {};

  if (Platform.OS === 'ios') {
    RNCameraProps.onBarCodeRead = ({data}) => {
      handleQrCode(data);
      console.log('IOS', data);
    };
  } else {
    RNCameraProps.onGoogleVisionBarcodesDetected = ({barcodes}) => {
      if (barcodes !== undefined && barcodes.length > 0) {
        animate();
        const response = barcodes[0].data;
        console.log('Android', response);
        handleQrCode(response);
      }
    };
  }

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
        // onBarCodeRead={(barcodes) => {
        //   handleQrCode(barcodes.data);
        // }}
        {...RNCameraProps}>
        <View style={{flex: 1}}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={handleBack}>
              <Image style={styles.backButton} source={BackButton} />
            </TouchableOpacity>
            <Text style={styles.title}>{translationString.scan}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={ScanIcon} />
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.infoContainer}>
              <View style={styles.valueContainer}>
                <Text style={styles.numberLabel}>
                  {jobTransferModel.selectedJobs.length}
                </Text>
                <Text style={styles.label}>{translationString.selected}</Text>
              </View>
              <Text style={styles.divideLabel}>/</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.numberLabel}>
                  {jobTransferModel.jobs.length}
                </Text>
                <Text style={styles.label}>{translationString.total}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmButtonOnPressed}>
              <Text style={styles.confirmButtonText}>
                {translationString.confirm}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNCamera>
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
  searchBtManuallyButton: {
    padding: 8,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  searchBtManuallyText: {
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
    flexWrap: 'wrap',
    flexDirection: 'row',
    backgroundColor: 'rgb(255, 255, 255)',
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
  content: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: Constants.screenWidth - 60,
    marginVertical: hp('15%'),
    height: hp('80%'),
  },
  confirmButton: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Completed_Color,
  },
  confirmButtonText: {
    color: Constants.WHITE,
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
  },
  infoContainer: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: 'rgb(255, 255, 255)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divideLabel: {
    marginHorizontal: 10,
    fontSize: 40,
    fontWeight: '500',
    color: Constants.Dark_Grey,
  },
  numberLabel: {
    fontSize: 20,
    color: Constants.Dark_Grey,
    fontFamily: Constants.NoboSansBoldFont,
  },
  label: {
    fontSize: 18,
    color: Constants.Dark_Grey,
    fontFamily: Constants.NoboSansFont,
  },
});
