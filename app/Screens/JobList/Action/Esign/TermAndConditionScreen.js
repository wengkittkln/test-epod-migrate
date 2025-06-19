import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {useTermAndCondition} from '../../../../Hooks/JobList/Action/Esign/useTermAndCondition';
import * as Constants from '../../../../CommonConfig/Constants';
import HTML from 'react-native-render-html';

export default ({route, navigation}) => {
  const {tnc} = useTermAndCondition(route, navigation);
  const contentWidth = useWindowDimensions().width;

  return (
    <SafeAreaView style={styles.baseContainer}>
      <ScrollView>
        <HTML
          source={{
            html: `<html> <head><meta name="viewport" content="width=device-width, initial-scale=1.0"> </head>${tnc}</html>`,
          }}
          containerStyle={styles.webViewContainer}
          contentWidth={contentWidth}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    width: Constants.screenWidth,
    backgroundColor: 'white',
  },
  webViewContainer: {
    backgroundColor: 'white',
  },
});
