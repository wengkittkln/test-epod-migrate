import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Image,
  View,
  Animated,
  ImageBackground,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import KerryLogo from '../../Assets/image/android_splashscreen.png';
import {useNetwork} from '../../Hooks/Network/useNetwork';
import {useSplashScreen} from '../../Hooks/SplashScreen/useSplashScreen';

export default ({route, navigation}) => {
  const {networkModel} = useNetwork();
  const {opacity} = useSplashScreen();

  return <ImageBackground source={KerryLogo} style={styles.baseContainer} />;
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginTop: -20,
  },
});
