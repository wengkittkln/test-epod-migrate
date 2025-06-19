import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import {useRegister} from '../../Hooks/Auth/useRegister';
import CustomAlertView from '../../Components/CustomAlertView';
import LoadingModal from '../../Components/LoadingModal';

export default ({navigation}) => {
  const {
    alertMsg,
    registerModel,
    isShowLoadingIndicator,
    usernameOnChangeText,
    nameOnChangeText,
    passwordOnChangeText,
    confirmPasswordOnChangeText,
    emailOnChangeText,
    phoneNoOnChangeText,
    companyOnChangeText,
    inputValidationRegister,
  } = useRegister(navigation);

  const [passwordStrength, setPasswordStrength] = useState('');

  const checkPasswordStrength = () => {
    const password = registerModel.password;
    if (password == '' || password == null) {
      setPasswordStrength('');
      return;
    }
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%^&*()-_=+[]{}|;:\'",.<>?/`~';

    let characterSetSize = 0;
    if (/[a-z]/.test(password)) {
      characterSetSize += lowerCase.length;
    }
    if (/[A-Z]/.test(password)) {
      characterSetSize += upperCase.length;
    }
    if (/[0-9]/.test(password)) {
      characterSetSize += numbers.length;
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
      characterSetSize += specialCharacters.length;
    }

    const totalCombinations = Math.pow(characterSetSize, password.length);

    const guessesPerSecond = 1e10;

    const timeToCrackInSeconds = totalCombinations / guessesPerSecond;

    const secondsInADay = 86400;
    const timeToCrackInDays = timeToCrackInSeconds / secondsInADay;

    if (timeToCrackInDays < 1) {
      setPasswordStrength('very-weak');
    } else if (timeToCrackInDays < 7) {
      setPasswordStrength('weak');
    } else if (timeToCrackInDays < 30) {
      setPasswordStrength('moderate');
    } else if (timeToCrackInDays < 365) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('very-strong');
    }
  };

  const getStrengthStyle = (strength) => {
    switch (strength) {
      case 'very-weak':
        return styles.veryWeak;
      case 'weak':
        return styles.weak;
      case 'moderate':
        return styles.moderate;
      case 'strong':
        return styles.strong;
      case 'very-strong':
        return styles.veryStrong;
      default:
        return {flex: 0, backgroundColor: '#e0e0e0'};
    }
  };

  const StrengthBar = ({strengthLevel}) => {
    const strengthStyle = getStrengthStyle(strengthLevel);

    return <View style={[styles.strengthBar, strengthStyle]} />;
  };

  const CheckPasswordFulfillRequirementUI = () => {
    const password = registerModel.password;
    const checkCriteria = (regex) => regex.test(password);

    return (
      <View style={styles.container}>
        <View style={styles.column}>
          <Text
            style={[
              styles.text,
              checkCriteria(/\S{10,}/) && styles.successText,
            ]}>
            • {translationString.atLeast10Character}
          </Text>
          <Text
            style={[
              styles.text,
              checkCriteria(/[@$!%*?&#]/) && styles.successText,
            ]}>
            • {translationString.includeSpecialCharacter}
          </Text>
        </View>
        <View style={styles.column}>
          <Text
            style={[styles.text, checkCriteria(/[A-Z]/) && styles.successText]}>
            • {translationString.includeUppercase}
          </Text>
          <Text
            style={[styles.text, checkCriteria(/\d/) && styles.successText]}>
            • {translationString.includeNumber}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.baseContainer}>
      <ScrollView bounces={false} style={styles.scrollView}>
        <Text style={styles.label}>{translationString.username}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={usernameOnChangeText}
          value={registerModel.username}
        />
        <Text style={styles.label}>{translationString.name_colon}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={nameOnChangeText}
          value={registerModel.name}
          autoCapitalize={'none'}
        />
        <Text style={styles.label}>{translationString.password}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(data) => {
            checkPasswordStrength();
            passwordOnChangeText(data);
          }}
          value={registerModel.password}
          secureTextEntry={true}
          autoCapitalize={'none'}
        />
        <View style={{marginHorizontal: 42}}>
          <View style={styles.strengthMeter}>
            <StrengthBar strengthLevel={passwordStrength} />
            <View style={[styles.line, styles.line20]} />
            <View style={[styles.line, styles.line40]} />
            <View style={[styles.line, styles.line60]} />
            <View style={[styles.line, styles.line80]} />
          </View>
        </View>
        <CheckPasswordFulfillRequirementUI />
        <Text style={styles.label}>
          {translationString.confirm_password_colon}
        </Text>
        <TextInput
          style={styles.textInput}
          onChangeText={confirmPasswordOnChangeText}
          value={registerModel.confirmPassword}
          secureTextEntry={true}
          autoCapitalize={'none'}
        />
        <Text style={styles.label}>{translationString.email_colon}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={emailOnChangeText}
          keyboardType="email-address"
          value={registerModel.email}
          autoCapitalize={'none'}
        />
        <Text style={styles.label}>{translationString.phone_num_colon}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={phoneNoOnChangeText}
          value={registerModel.phoneNo}
          keyboardType="phone-pad"
          autoCapitalize={'none'}
        />
        <Text style={styles.label}>{translationString.company_colon}</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={companyOnChangeText}
          value={registerModel.company}
          autoCapitalize={'none'}
        />

        <View style={styles.registerButtonContainer}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={inputValidationRegister}>
            <Text style={styles.registerText}>
              {translationString.register}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  registerButtonContainer: {
    flex: 1,
    color: Constants.THEME_COLOR,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    flex: 1,
    marginTop: 46,
    borderRadius: 400,
    backgroundColor: Constants.THEME_COLOR,
    padding: 10,
  },
  registerText: {
    paddingStart: 16,
    paddingEnd: 16,
    minWidth: 150,
    textAlign: 'center',
    color: Constants.WHITE,
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.fontFamily,
  },
  strengthBar: {
    height: '100%',
  },
  veryWeak: {
    width: '20%',
    backgroundColor: 'red',
  },
  weak: {
    width: '40%',
    backgroundColor: 'lightcoral',
  },
  moderate: {
    width: '60%',
    backgroundColor: 'orange',
  },
  strong: {
    width: '80%',
    backgroundColor: 'yellowgreen',
  },
  veryStrong: {
    width: '100%',
    backgroundColor: 'green',
  },
  strengthMeter: {
    position: 'relative',
    width: '100%',
    height: 5,
    backgroundColor: '#e0e0e0',
    marginTop: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    height: 5,
    width: 2,
    backgroundColor: 'white',
    top: 0,
  },
  line20: {
    left: '20%',
  },
  line40: {
    left: '40%',
  },
  line60: {
    left: '60%',
  },
  line80: {
    left: '80%',
  },
  container: {
    flexDirection: 'row',
    marginHorizontal: 42,
    marginTop: 5,
    width: '100%',
  },
  column: {
    flexDirection: 'column',
    width: '50%',
  },
  text: {
    fontSize: 10,
    color: '#848484',
    fontWeight: 'bold',
  },
  successText: {
    color: 'green',
  },
});
