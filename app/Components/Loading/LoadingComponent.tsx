import React, {useState} from 'react';
import {useEffect} from 'react';
import {
  StyleSheet,
  ImageBackground,
  Animated,
  Modal,
  SafeAreaView,
  Text,
  InteractionManager,
  Image,
} from 'react-native';
import {ImageRes} from '../../Assets';
import LottieView from 'lottie-react-native';
import LottieFile from '../../Assets/lottie/epod.json';
import * as Constants from '../../CommonConfig/Constants';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {translationString} from '../../Assets/translation/Translation';
import KerryLogo from '../../Assets/image/img_kerry.png';

const LoadingIndicator = ({isVisible}) => {
  return (
    <Modal animationType="fade" transparent={false} visible={isVisible}>
      <SafeAreaView style={styles.baseContainer}>
        {/* <LottieView
          style={{marginTop: -hp('5%')}}
          source={LottieFile}
          autoSize
          autoPlay
          loop
        /> */}
        <Image style={styles.logo} source={KerryLogo} />
        <Text style={styles.label}>{translationString.loading}</Text>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 18,
    fontFamily: Constants.fontFamily,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default LoadingIndicator;
