import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import LoginLoadingIndicator from '../../Components/LoginLoadingIndicator';
import CustomAlertView from '../../Components/CustomAlertView';
import * as Constants from '../../CommonConfig/Constants';
import KerryLogo from '../../Assets/image/icon_splash_logo.png';
import CurveBackground from '../../Assets/image/img_curve_bg.png';
import LanguageIcon from '../../Assets/image/icon_language_grey.png';
import DeviceInfo from 'react-native-device-info';
import {translationString} from '../../Assets/translation/Translation';
import {useLogin} from '../../Hooks/Auth/useLogin';
import {CopyIcon} from '../../Assets/ImageRes';
import Clipboard from '@react-native-clipboard/clipboard';
import {ToastMessage} from '../../Components/Toast/ToastMessage';

export default ({navigation}) => {
  const {
    networkModel,
    isShowLoadingIndicator,
    alertMsg,
    loadingText,
    windowWidth,
    windowHeight,
    is2FAPage,
    loginModel,
    languageModel,
    usernameOnChangeText,
    passwordOnchangeText,
    inputValidation,
    gotoLanguageScreen,
    gotoRegisterScreen,
    twoFAInfo,
    isUserSetup2FA,
    verifyUser2FA,
    redirectBackToLoginPage,
    gotoRequestResetPasswordScreen,
  } = useLogin(navigation);

  return (
    <View
      style={[
        styles.baseContainer,
        {height: windowHeight, width: windowWidth},
      ]}>
      <ScrollView
        bounces={false}
        style={[styles.scrollView, {height: windowHeight, width: windowWidth}]}>
        <View style={[styles.header, {width: windowWidth}]}>
          <Image
            source={KerryLogo}
            style={styles.logo}
            resizeMode={'contain'}
          />
          <Image
            source={CurveBackground}
            style={[styles.curveBackgroundImg, {width: windowWidth}]}
            resizeMode={'stretch'}
          />
        </View>
        {!is2FAPage ? (
          <LoginForm
            windowWidth={windowWidth}
            usernameOnChangeText={usernameOnChangeText}
            loginModel={loginModel}
            passwordOnchangeText={passwordOnchangeText}
            inputValidation={inputValidation}
            gotoLanguageScreen={gotoLanguageScreen}
            languageModel={languageModel}
            gotoRegisterScreen={gotoRegisterScreen}
            gotoRequestResetPasswordScreen={gotoRequestResetPasswordScreen}
          />
        ) : (
          <SetupTwoFAForm
            windowWidth={windowWidth}
            twoFAInfo={twoFAInfo}
            verifyUser2FA={verifyUser2FA}
            redirectBackToLoginPage={redirectBackToLoginPage}
            isUserSetup2FA={isUserSetup2FA}
          />
        )}
      </ScrollView>
      <LoginLoadingIndicator
        isVisible={isShowLoadingIndicator}
        message={loadingText}
      />
      {alertMsg !== '' && <CustomAlertView alertMsg={alertMsg} />}
      {!networkModel.isConnected && (
        <SafeAreaView style={styles.noInternetContainer}>
          <Text style={styles.versionText}>
            {translationString.no_internet_connection}
          </Text>
        </SafeAreaView>
      )}
    </View>
  );
};

function LoginForm({
  windowWidth,
  usernameOnChangeText,
  loginModel,
  passwordOnchangeText,
  inputValidation,
  gotoLanguageScreen,
  languageModel,
  gotoRegisterScreen,
  gotoRequestResetPasswordScreen,
}) {
  return (
    <View style={[styles.content, {width: windowWidth}]}>
      <Text style={styles.label}>{translationString.username}</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={usernameOnChangeText}
        value={loginModel.username}
        autoCapitalize={'none'}
      />
      <Text style={styles.label}>{translationString.password}</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={passwordOnchangeText}
        value={loginModel.password}
        secureTextEntry={true}
        autoCapitalize={'none'}
      />
      <TouchableOpacity style={styles.loginButton} onPress={inputValidation}>
        <Text style={styles.loginButtonText}>
          {translationString.login.toUpperCase()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={gotoRequestResetPasswordScreen}>
        <Text style={styles.registerText}>
          {translationString.forgotPassword}?
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={gotoLanguageScreen}>
        <Image
          style={styles.languageIcon}
          source={LanguageIcon}
          resizeMode={'contain'}
        />
        <Text style={styles.languageText}>{languageModel.title}</Text>
      </TouchableOpacity>
      <Text style={styles.versionText}>
        {translationString.version} {DeviceInfo.getVersion()}{' '}
        {Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Uat
          ? 'Trial'
          : Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Staging
          ? 'Staging'
          : Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Stg
          ? 'Staging(HK)'
          : Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.PreProd
          ? 'Pre-Production'
          : 'Production'}
      </Text>

      <TouchableOpacity onPress={gotoRegisterScreen}>
        <Text style={styles.registerText}>
          {translationString.registermessage}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function SetupTwoFAForm({
  twoFAInfo,
  verifyUser2FA,
  redirectBackToLoginPage,
  windowWidth,
  isUserSetup2FA,
}) {
  const [code, setCode] = useState('');

  const copySecretCode = () => {
    Clipboard.setString(twoFAInfo.manualEntrySetupCode);
    ToastMessage({text1: 'Copied to clipboard'});
  };

  const verify = () => {
    verifyUser2FA(code);
  };

  const back = () => {
    setCode('');
    redirectBackToLoginPage();
  };

  return (
    <ScrollView style={[styles.content, {width: windowWidth}]}>
      {!isUserSetup2FA ? (
        <View>
          <Text style={styles.twoFALabel}>
            {translationString.secureYourAccount}
          </Text>
          <Text style={styles.twoFALabel}>
            {translationString.pleaseEnableTwoFactorAuthentication}
          </Text>
          <Text style={styles.twoFASubLabel}>
            {translationString.twoFactorMessageOne}
          </Text>
          <Text style={styles.twoFASubLabel}>
            {translationString.twoFactorMessageTwo}
          </Text>
          <View style={[styles.qrCodeContainer]}>
            {twoFAInfo.qrCodeImageUrl !== '' && (
              <Image
                style={styles.qrCode}
                source={{uri: twoFAInfo.qrCodeImageUrl}}
                resizeMode={'contain'}
              />
            )}
            <Text style={[styles.textAlignCenter]}>
              {translationString.twoFactorMessageThree}
            </Text>
            <Text style={[styles.textAlignCenter, styles.marginTop5]}>
              {translationString.twoFactorMessageFour}
            </Text>
            <View style={[styles.secretCodeContainer]}>
              <Text style={styles.secretCode}>
                {twoFAInfo.manualEntrySetupCode}
              </Text>
              <TouchableOpacity onPress={copySecretCode}>
                <Image
                  style={styles.copyIcon}
                  source={CopyIcon}
                  resizeMode={'contain'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.twoFALabel}>
            {translationString.twoFactorAuthentication}
          </Text>
        </View>
      )}

      <View style={styles.verificationCodeContainer}>
        <Text style={styles.verificationCodeText}>
          {translationString.verificationCode}
        </Text>
        <View style={styles.sixDigitContainer}>
          <TextInput
            value={code}
            onChangeText={(text) => setCode(text)}
            style={styles.sixDigitInput}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
        <View style={styles.twoFAButtonContainer}>
          <TouchableOpacity
            style={[styles.twoFAButton, styles.twoFASecondaryButton]}
            onPress={() => back()}>
            <Text style={[styles.loginButtonText, styles.whiteText]}>
              {translationString.back}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.twoFAButton]}
            onPress={() => verify()}>
            <Text style={[styles.loginButtonText]}>
              {translationString.verify}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Constants.THEME_COLOR,
  },
  scrollView: {
    width: Constants.screenWidth,
    height: Constants.screenHeight,
    backgroundColor: Constants.THEME_COLOR,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
  },
  content: {
    backgroundColor: Constants.THEME_COLOR,
    paddingBottom: 100,
    marginTop: -2,
  },
  logo: {
    marginTop: 83,
  },
  curveBackgroundImg: {
    width: Constants.screenWidth,
    marginTop: 60,
  },
  button: {
    marginVertical: 10,
    width: 300,
    backgroundColor: 'orange',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 42,
    marginTop: 20,
    marginRight: 42,
    color: 'white',
    fontSize: Constants.normalFontSize,
    fontFamily: Constants.fontFamily,
  },
  textInput: {
    marginLeft: 42,
    marginRight: 42,
    color: 'white',
    borderBottomColor: 'white',
    borderBottomWidth: 2,
    fontSize: Constants.textInputFonSize,
    height: 48,
    fontFamily: Constants.fontFamily,
  },
  loginButton: {
    marginHorizontal: 79,
    marginTop: 46,
    borderRadius: 400,
    padding: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: Constants.THEME_COLOR,
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.fontFamily,
  },
  languageButton: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 6,
  },
  languageIcon: {
    marginHorizontal: 16,
    tintColor: 'white',
  },
  languageText: {
    color: 'white',
    fontFamily: Constants.fontFamily,
    fontSize: Constants.normalFontSize,
  },
  versionText: {
    color: 'white',
    fontFamily: Constants.fontFamily,
    fontSize: Constants.normalFontSize,
    alignSelf: 'center',
    padding: 16,
  },
  noInternetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  registerText: {
    color: 'white',
    fontFamily: Constants.fontFamily,
    fontSize: Constants.normalFontSize,
    alignSelf: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  twoFALabel: {
    marginLeft: 35,
    marginTop: 20,
    marginRight: 35,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  twoFASubLabel: {
    marginLeft: 35,
    marginTop: 5,
    marginRight: 35,
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  qrCode: {
    width: 175,
    height: 175,
  },
  qrCodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 35,
    padding: 20,
    borderRadius: 5,
    marginTop: 5,
  },
  secretCodeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  secretCode: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  copyIcon: {
    marginLeft: 5,
    width: 18,
    height: 18,
  },
  verificationCodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
    paddingHorizontal: 35,
  },
  sixDigitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sixDigitInput: {
    flex: 1,
    height: 45,
    fontSize: 18,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  twoFAButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  twoFAButton: {
    borderRadius: 10,
    padding: 15,
    width: 125,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoFASecondaryButton: {
    backgroundColor: Constants.THEME_COLOR,
    borderWidth: 1,
    borderColor: 'white',
  },
  verificationCodeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  marginTop5: {
    marginTop: 5,
  },
  textAlignCenter: {
    textAlign: 'center',
  },
  whiteText: {
    color: 'white',
  },
});
