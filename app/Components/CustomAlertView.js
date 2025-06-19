/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, Text, Animated, StyleSheet} from 'react-native';
import * as Constants from '../CommonConfig/Constants';

const CustomAlertView = ({alertMsg}) => {
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 3000);
  }, []);

  return (
    <Animated.View style={[styles.componentContainer, {opacity}]}>
      <View style={styles.textContainer}>
        <Text style={styles.fontStyle}>{alertMsg}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  componentContainer: {
    position: 'absolute',
    bottom: 25,
    width: '100%',
  },
  textContainer: {
    borderRadius: 5,
    backgroundColor: 'rgb(50, 50, 50)',
    marginHorizontal: 20,
    justifyContent: 'center',
    padding: 16,
  },
  fontStyle: {
    color: 'white',
    fontSize: Constants.normalFontSize,
  },
});

export default CustomAlertView;
