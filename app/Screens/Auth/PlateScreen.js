import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import {TextInput} from 'react-native-gesture-handler';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import {usePlate} from '../../Hooks/Auth/usePlate';
import CustomAlertView from '../../Components/CustomAlertView';
import LoadingModal from '../../Components/LoadingModal';
import CompleteIcon from '../../Assets/image/icon_success.png';
import {DRIVER_TYPE} from '../../CommonConfig/Constants';

export default ({route, navigation}) => {
  const userModel = useSelector((state) => state.UserReducer);
  const {
    alertMsg,
    isShowLoadingIndicator,
    plateNo,
    plateNoOnChangeText,
    submitButtonOnClick,
    driverName,
    driverPhoneNumber,
    driverNameOnChangeText,
    phoneNumberOnChangeText,
  } = usePlate(navigation);
  // console.log('aadriver', JSON.stringify(userModel));

  const renderSubconInfo = () => {
    if (
      userModel.driverType &&
      userModel.driverType === DRIVER_TYPE.SUBCONTRACTOR
    ) {
      return (
        <>
          <Text style={styles.label}>{translationString.driver_name}</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={driverNameOnChangeText}
            value={driverName}
            autoCapitalize={'none'}
          />
          <Text style={styles.label}>{translationString.driver_phone}</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={phoneNumberOnChangeText}
            value={driverPhoneNumber}
            autoCapitalize={'none'}
            keyboardType="phone-pad"
          />
        </>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.baseContainer}>
      <ScrollView bounces={false} style={styles.scrollView}>
        {renderSubconInfo()}
        <Text style={styles.label}>{translationString.plate_no}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={plateNoOnChangeText}
          value={plateNo}
          autoCapitalize={'none'}
        />
      </ScrollView>
      <TouchableOpacity
        underlayColor={Constants.Green_Underlay}
        style={styles.confirmButtonContainer}
        onPress={submitButtonOnClick}>
        <View style={styles.button}>
          <Image style={styles.icon} source={CompleteIcon} />
          <Text style={styles.nextButton}>{translationString.submit}</Text>
        </View>
      </TouchableOpacity>
      <LoadingModal
        isShowLoginModal={isShowLoadingIndicator}
        message={translationString.loading2}
      />

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
    color: Constants.WHITE,
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
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonContainer: {
    backgroundColor: Constants.Completed_Color,
    padding: 24,
  },
  nextButton: {
    fontSize: 24,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.WHITE,
  },
});
