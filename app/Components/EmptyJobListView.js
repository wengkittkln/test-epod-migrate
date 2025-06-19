import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import * as Constants from '../CommonConfig/Constants';

const EmptyJobListView = ({message}) => {
  return <Text style={styles.noData}>{message}</Text>;
};

const styles = StyleSheet.create({
  noData: {
    fontFamily: Constants.NoboSansFont,
    fontSize: Constants.buttonFontSize,
    color: Constants.Dark_Grey,
  },
});

export default EmptyJobListView;
