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
import {ImageRes} from '../../Assets';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import {useMarketPlaceScanQR} from '../../Hooks/MarketPlaces/useMarketPlaceScanQR';
import {MarketPlaceListProps} from '../../NavigationStacks/MarketPlaceStack';
import Modal from 'react-native-modal';
import {CustomDialogView} from '../../Components/General/CustomDialogView';
import {useFocusEffect} from '@react-navigation/native';

export const MarketPlaceScanQR = ({navigation}: MarketPlaceListProps) => {
  const {
    fadeAnim,
    addBarcode,
    getSelectedCount,
    isLoading,
    isShowMessage,
    setShowMessage,
    dialogMessage,
  } = useMarketPlaceScanQR();

  const RNCameraProps: RNCameraProps = {};
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
        const {width} = e.nativeEvent.layout;
        setWidth(width);
      }}>
      <CustomDialogView
        onRightClick={() => {
          setShowMessage(false);
        }}
        isError={true}
        isShow={isShowMessage}
        description={dialogMessage}
      />
      <Modal isVisible={isLoading} coverScreen={true}>
        <ActivityIndicator color={Constants.THEME_COLOR} />
      </Modal>
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
          },
          styles.aniamtionFlash,
        ]}></Animated.View>
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
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          navigation.navigate('MarketPlaceConfirmList');
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
