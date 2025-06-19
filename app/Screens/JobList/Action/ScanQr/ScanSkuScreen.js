import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  TextInput,
  Platform,
  SafeAreaView,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {useScanSku} from '../../../../Hooks/JobList/Action/ScanQr/useScanSku';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import ScanIcon from '../../../../Assets/image/icon_photo_frame.png';
import ScannedIcon from '../../../../Assets/image/icon_photo_green_frame.png';
import {translationString} from '../../../../Assets/translation/Translation';
import * as Constants from '../../../../CommonConfig/Constants';
import {useIsFocused} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';

export default ({route, navigation}) => {
  const {
    handleBarcode,
    handleBack,
    totalItems,
    scannedItems,
    confirmButtonOnPress,
    isShowModal,
    modalTitle,
    modalDesc,
    detailOnPress,
    isShowSkuInputModal,
    onSkipSkuClicked,
    onCancelSkipSkuClicked,
    skuInputText,
    skuError,
    onChangeSkuText,
    onInputSkuConfirmClicked,
    hasError,
    input,
  } = useScanSku(route, navigation);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();

  const animate = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true, // Add This line
    }).start(({finished}) => {
      /* completion callback */
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true, // Add This line
      }).start();
    });
  };

  const renderSkipSku = () => {
    return (
      <TouchableOpacity
        style={styles.skipScanningContainer}
        onPress={() => {
          onSkipSkuClicked();
        }}>
        <Text style={styles.skipText}>{translationString.password_input}</Text>
      </TouchableOpacity>
    );
  };

  const renderSkipSkuModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isShowSkuInputModal}>
        <View style={styles.darkBackground}>
          <View style={styles.modelView}>
            <Text style={styles.modelTitle}>
              {translationString.password_input}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.modelText}>
              {translationString.please_input_sku}
            </Text>
            <TextInput
              ref={input}
              style={[
                styles.textInput,
                {
                  color: skuError !== '' ? 'red' : 'black',
                  borderColor: skuError !== '' ? 'red' : 'transparent',
                },
              ]}
              onChangeText={(text) => {
                onChangeSkuText(text);
              }}
              value={skuInputText}
              autoCapitalize={'none'}
              onSubmitEditing={() => {
                onInputSkuConfirmClicked(skuInputText);
                setTimeout(() => input.current.focus(), 250);
              }}
              autoFocus={true}
            />
            <Text style={styles.modelErrorText}>{skuError}</Text>
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                underlayColor={Constants.Light_Grey_Underlay}
                style={styles.cancelButtonContainer}
                onPress={() => {
                  onCancelSkipSkuClicked();
                }}>
                <Text style={styles.cancelModelButton}>
                  {translationString.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                underlayColor={
                  hasError ? Constants.Red_Underlay : Constants.Green_Underlay
                }
                style={
                  hasError
                    ? styles.confirmModalFailButtonContainer
                    : styles.confirmModalButtonContainer
                }
                onPress={() => onInputSkuConfirmClicked(skuInputText)}>
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

  const RNCameraProps = {};

  if (Platform.OS === 'ios') {
    RNCameraProps.onBarCodeRead = ({data}) => {
      if (data) {
        animate();
      }

      handleBarcode(data);
      console.log('IOS', data);
    };
  } else {
    RNCameraProps.onGoogleVisionBarcodesDetected = ({barcodes}) => {
      if (barcodes !== undefined && barcodes.length > 0) {
        animate();
        const response = barcodes[0].data;
        console.log('Android', response);
        handleBarcode(response);
      }
    };
  }

  const renderRNCamera = () => {
    let parentWidth = 100;
    return (
      <View
        style={{height: '100%'}}
        onLayout={(e) => {
          const {width} = e.nativeEvent.layout;
          parentWidth = width;
        }}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          // onBarCodeRead={(barcodes) => {
          //   if (barcodes.data) {
          //     animate();
          //   }
          //   handleBarcode(barcodes.data);
          // }}
          {...RNCameraProps}>
          <View style={[styles.topContainer, {width: '100%'}]}>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={handleBack}>
              <Image style={styles.backButton} source={BackButton} />
            </TouchableOpacity>
            <Text style={styles.title}>{translationString.scan_barcode}</Text>
            {renderSkipSku()}
          </View>
          <View style={styles.snapIconContainer}>
            <Animated.View style={styles.imageContainer}>
              <Image style={styles.image} source={ScanIcon} />
            </Animated.View>
            <Animated.View
              style={[styles.imageBackgroundContainer, {opacity: fadeAnim}]}>
              <Image style={styles.image} source={ScannedIcon} />
            </Animated.View>
          </View>

          <View style={styles.scanContainer}>
            <View>
              <View style={styles.horizontalContainer}>
                <Text style={styles.label}>
                  {translationString.order_item_title}
                </Text>
                <TouchableOpacity onPress={detailOnPress}>
                  <Text style={styles.detailLabel}>
                    {translationString.detail}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.horizontalContainer}>
              <View style={styles.scanItem}>
                <Text style={styles.scanItemAmount}>{scannedItems}</Text>
                <Text style={styles.scanItemText}>
                  {translationString.scanned}
                </Text>
              </View>
              <View>
                <Text style={styles.scanDivider}>/</Text>
              </View>
              <View style={styles.scanItem}>
                <Text style={styles.scanItemAmount}>{totalItems}</Text>
                <Text style={styles.scanItemText}>{translationString.all}</Text>
              </View>
            </View>
          </View>

          <Modal animationType="fade" transparent={true} visible={isShowModal}>
            <View style={styles.darkBackground}>
              <View style={styles.modelView}>
                <Text style={styles.modelTitle}>{modalTitle}</Text>
                <View style={styles.divider} />
                <Text style={styles.modelDesc}>{modalDesc}</Text>
                <View style={styles.bottomButtonContainer}>
                  <TouchableOpacity
                    underlayColor={
                      hasError
                        ? Constants.Red_Underlay
                        : Constants.Green_Underlay
                    }
                    style={
                      hasError
                        ? styles.confirmModalFailButtonContainer
                        : styles.confirmModalButtonContainer
                    }
                    onPress={confirmButtonOnPress}>
                    <Text style={styles.confirmModelButton}>
                      {translationString.confirm}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </RNCamera>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {isFocused ? renderRNCamera() : null}
        {renderSkipSkuModal()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Text: {
    fontSize: 20,
    color: Constants.Text_Color,
  },
  label: {
    fontSize: 15,
    color: Constants.Text_Color,
  },
  detailLabel: {
    fontSize: 15,
    color: Constants.THEME_COLOR,
    textDecorationLine: 'underline',
  },
  preview: {
    flex: 1,
  },
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelDesc: {
    fontSize: 20,
    paddingBottom: 45,
    paddingHorizontal: 24,
    alignSelf: 'center',
    color: Constants.Dark_Grey,
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
  bottomButtonContainer: {
    flexDirection: 'row',
  },
  snapIconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  confirmModalButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Completed_Color,
    borderBottomRightRadius: 8,
  },
  confirmModalFailButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Failed_Color,
    borderBottomRightRadius: 8,
  },
  confirmModelButton: {
    fontSize: 18,
    color: Constants.WHITE,
    alignSelf: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  scanContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'column',
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scanItem: {
    flex: 2,
    alignItems: 'center',
  },
  scanDivider: {
    flex: 1,
    fontSize: 45,

    justifyContent: 'center',
    alignItems: 'center',
    color: Constants.Text_Color,
    fontWeight: 'bold',
  },
  scanItemText: {
    fontSize: 20,
    color: Constants.Text_Color,
  },
  scanItemAmount: {
    fontSize: 35,
    color: Constants.Text_Color,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
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
  title: {
    flex: 1,
    padding: 15,
    fontSize: 20,
    paddingEnd: 56,
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  image: {
    alignSelf: 'center',
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
  modelErrorText: {
    fontSize: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    color: 'red',
    marginBottom: 48,
  },
});
