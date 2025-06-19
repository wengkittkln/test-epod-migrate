import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import * as Constants from '../CommonConfig/Constants';
import LottieView from 'lottie-react-native';
import LottieFile from '../Assets/lottie/epod.json';
import KerryLogo from '../Assets/image/img_kerry.png';

const LoginLoadingIndicator = ({isVisible, message}) => {
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
        <Text style={styles.label}>{message}</Text>
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

export default LoginLoadingIndicator;
