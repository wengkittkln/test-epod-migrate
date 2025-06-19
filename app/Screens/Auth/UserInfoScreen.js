import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import {useUserInfo} from '../../Hooks/Auth/useUserInfo';
import CustomAlertView from '../../Components/CustomAlertView';

export default ({route, navigation}) => {
  const {
    buttonText,
    alertMsg,
    userInfoModel,
    nameOnChangeText,
    phoneNoOnChangeText,
    truckNoOnChangeText,
    companyNameOnChangeText,
    inputValidationUserInfo,
  } = useUserInfo(route, navigation);

  return (
    <SafeAreaView style={styles.baseContainer}>
      <ScrollView bounces={false} style={styles.scrollView}>
        <Text style={styles.label}>{translationString.name_colon}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={nameOnChangeText}
          value={userInfoModel.name}
          autoCapitalize={'none'}
        />
        <Text style={styles.label}>{translationString.truck_number_colon}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={truckNoOnChangeText}
          value={userInfoModel.truckNo}
          autoCapitalize={'none'}
        />
        <Text style={styles.label}>{translationString.company}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={companyNameOnChangeText}
          value={userInfoModel.companyName}
          autoCapitalize={'none'}
        />
        <Text style={styles.label}>{translationString.phone_number}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={phoneNoOnChangeText}
          value={userInfoModel.phoneNumber}
          keyboardType="phone-pad"
          autoCapitalize={'none'}
        />

        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={inputValidationUserInfo}>
            <Text style={styles.submitText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {alertMsg !== '' && <CustomAlertView alertMsg={alertMsg} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Constants.WHITE,
  },
  label: {
    marginLeft: 42,
    marginTop: 20,
    marginRight: 42,
    color: '#00000066',
    fontSize: Constants.normalFontSize,
    fontFamily: Constants.fontFamily,
  },
  textInput: {
    marginLeft: 42,
    marginRight: 42,
    color: '#00000066',
    borderBottomColor: '#00000066',
    borderBottomWidth: 2,
    fontSize: Constants.textInputFonSize,
    height: 48,
    fontFamily: Constants.fontFamily,
  },
  submitButtonContainer: {
    flex: 1,
    color: Constants.THEME_COLOR,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    marginTop: 46,
    borderRadius: 400,
    backgroundColor: Constants.THEME_COLOR,
    padding: 10,
  },
  submitText: {
    paddingStart: 16,
    paddingEnd: 16,
    minWidth: 150,
    textAlign: 'center',
    color: Constants.WHITE,
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.fontFamily,
  },
});
