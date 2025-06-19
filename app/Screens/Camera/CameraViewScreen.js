import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {ImageRes} from '../../Assets';
import {useCamera} from '../../Hooks/Camera/useCamera';
import {RNCamera} from 'react-native-camera';
import SnapPhotoIcon from '../../Assets/image/icon_camerasnap.png';
import AddImageIcon from '../../Assets/image/icon_addimage.png';
import {useFocusEffect} from '@react-navigation/native';
import * as Constants from '../../CommonConfig/Constants';

export default ({route, navigation}) => {
  const {cameraRef, takePhoto, photoPreview, currentPhotoPath} = useCamera(
    route,
    navigation,
  );

  const [width, setWidth] = useState(0);
  let isBarcodeScannerEnabled = true;

  return (
    <SafeAreaView
      style={styles.container}
      onLayout={(e) => {
        const {width} = e.nativeEvent.layout;
        setWidth(width);
      }}>
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        playSoundOnCapture={true}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}>
        <View style={{flex: 1}}>
          <View
            style={
              (styles.topContainer, {width, paddingTop: 20, paddingLeft: 20})
            }>
            <TouchableOpacity
              style={styles.backButtonContanier}
              onPress={() => navigation.pop()}>
              <Image style={styles.backButton} source={ImageRes.BackButton} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={photoPreview}>
            <Image
              style={styles.icon}
              source={
                !currentPhotoPath ? AddImageIcon : {uri: currentPhotoPath}
              }
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={styles.capture}>
            <Image source={SnapPhotoIcon} />
          </TouchableOpacity>

          {/* dummy component */}
          <TouchableOpacity onPress={() => {}}>
            <Image style={{tintColor: 'transparent'}} source={AddImageIcon} />
          </TouchableOpacity>
        </View>
      </RNCamera>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  topContainer: {
    flex: 0,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  icon: {
    height: 80,
    width: 80,
  },
  bottomContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
