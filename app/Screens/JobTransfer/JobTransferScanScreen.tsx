import React, {useLayoutEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import {
  JobTransferAddProps,
  JobTransferScanProps,
} from '../../NavigationStacks/JobTransferStack';
import * as Constants from '../../CommonConfig/Constants';
import {ImageRes} from '../../Assets';
import {RNCamera} from 'react-native-camera';
import {BackButton, JTScanIcon} from '../../Assets/ImageRes';
import {translationString} from '../../Assets/translation/Translation';
import LoadingModal from '../../Components/LoadingModal';
import {useJobTransferScan} from '../../Hooks/JobTransfer/useJobTransferScan';
import Toast from 'react-native-easy-toast';
import {useFocusEffect} from '@react-navigation/native';

export const JobTransferScanScreen = ({
  route,
  navigation,
}: JobTransferScanProps): JSX.Element => {
  const {
    cameraRef,
    isShowLoadingIndicator,
    isScanned,
    handleQrCodeScanned,
    comfirmSelect,
  } = useJobTransferScan(navigation);

  const screenWidth = Dimensions.get('screen').width;

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
          title: translationString.job_transfers.permission_to_use_camera,
          message:
            translationString.job_transfers.permission_to_use_camera_desc,
          buttonPositive: translationString.okText,
          buttonNegative: translationString.cancel,
        }}
        onBarCodeRead={(barcodes) => {
          handleQrCodeScanned(barcodes.data);
        }}>
        <View style={{flex: 1}}>
          <View
            style={[
              styles.topContainer,
              {
                width: screenWidth,
              },
            ]}>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={() => {
                navigation.goBack();
              }}>
              <Image style={styles.backButton} source={BackButton} />
            </TouchableOpacity>
            <Text style={styles.title}>{translationString.scan}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={JTScanIcon} />
          </View>
        </View>
      </RNCamera>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: Constants.THEME_COLOR},
          ]}
          onPress={() => {
            comfirmSelect();
          }}>
          <Text style={styles.confirmText}>{translationString.confirm}</Text>
        </TouchableOpacity>
      </View>

      <LoadingModal
        isShowLoginModal={isShowLoadingIndicator}
        message={translationString.searching}
      />
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {alignSelf: 'center'},
  bottomContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
});
