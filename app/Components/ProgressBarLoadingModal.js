/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {View, Text, Modal, StyleSheet, Image} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LottieView from 'lottie-react-native';
import LottieFile from '../Assets/lottie/epod.json';
import * as Progress from 'react-native-progress';
import * as Constants from './../CommonConfig/Constants';
import KerryLogo from '../Assets/image/img_kerry.png';

const ProgressBarLoadingModal = ({isShowLoginModal, message, progress}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={isShowLoginModal}>
      <View style={styles.darkBackground}>
        <View style={styles.content}>
          {/* <LottieView
            style={{alignSelf: 'center'}}
            source={LottieFile}
            autoSize
            autoPlay
            loop
          /> */}
          <Image style={styles.logo} source={KerryLogo} />
          <Text style={styles.loadingText}>{message}</Text>

          <Progress.Bar
            width={Constants.screenWidth - 90}
            progress={progress}
            color={Constants.THEME_COLOR}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: Constants.screenWidth - 60,
    justifyContent: 'center',
    padding: 15,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: Constants.fontFamily,
    alignSelf: 'center',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default ProgressBarLoadingModal;
