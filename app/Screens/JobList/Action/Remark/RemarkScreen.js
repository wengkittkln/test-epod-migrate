import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {translationString} from '../../../../Assets/translation/Translation';
import * as Constants from '../../../../CommonConfig/Constants';
import {useRemark} from '../../../../Hooks/JobList/Action/Remark/useRemark';

export default ({route, navigation}) => {
  const {
    remark,
    remarkTitle,
    remarkOnChangeText,
    confirmButtonOnPressed,
  } = useRemark(route, navigation);
  return (
    <SafeAreaView style={styles.baseContainer}>
      <ScrollView bounces={false} style={styles.scrollView}>
        <Text style={styles.label}>{remarkTitle}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => remarkOnChangeText(text)}
          value={remark}
          multiline={true}
          numberOfLines={4}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={confirmButtonOnPressed}>
            <Text style={styles.buttonText}>{translationString.confirm}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Constants.THEME_COLOR,
  },
  label: {
    marginHorizontal: 16,
    marginTop: 20,
    color: Constants.WHITE,
    fontSize: Constants.normalFontSize,
    fontFamily: Constants.fontFamily,
  },
  textInput: {
    margin: 16,
    padding: 16,
    height: 125,
    backgroundColor: '#EFEFEF',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flex: 1,
    color: Constants.WHITE,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    marginTop: 46,
    borderRadius: 400,
    backgroundColor: Constants.WHITE,
    padding: 10,
  },
  buttonText: {
    paddingStart: 16,
    paddingEnd: 16,
    minWidth: 150,
    textAlign: 'center',
    color: Constants.THEME_COLOR,
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.fontFamily,
  },
});
