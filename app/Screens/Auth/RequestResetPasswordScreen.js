import React, {useState, useEffect, useRef} from 'react';
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

import {translationString} from '../../Assets/translation/Translation';
import {useLogin} from '../../Hooks/Auth/useLogin';
import {ADMIN_URL} from '../../CommonConfig/Constants';
import {
  ToastMessageMultiLine,
  ToastMessageErrorMultiLine,
} from '../../Components/Toast/ToastMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default ({navigation}) => {
  const {
    networkModel,
    isShowLoadingIndicator,
    alertMsg,
    loadingText,
    windowWidth,
    windowHeight,
    twoFAInfo,
    isUserSetup2FA,
    verifyUser2FA,
    redirectBackToLoginPage,
    gotoLoginScreen,
    isRequestResetPassword,
    languageModel,
    requestResetPasswordEmail,
    requestResetPasswordPhoneNumber,
    requestNewVerificationCode,
    resetPasswordWithVerificationCode,
    email,
    setEmail,
    setIsRequestResetPassword,
    setIsShowLoadingIndicator,
  } = useLogin(navigation);

  const [resetScreen, setResetScreen] = useState('initial');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [resetMethod, setResetMethod] = useState('email');
  const [sendMethod, setSendMethod] = useState('sms');

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
        {isRequestResetPassword ? (
          <ResetPasswordSuccessPage
            windowWidth={windowWidth}
            twoFAInfo={twoFAInfo}
            verifyUser2FA={verifyUser2FA}
            redirectBackToLoginPage={redirectBackToLoginPage}
            isUserSetup2FA={isUserSetup2FA}
            gotoLoginScreen={gotoLoginScreen}
          />
        ) : resetScreen === 'combined' ? (
          <CombinedOTPPasswordForm
            windowWidth={windowWidth}
            goBack={() => setResetScreen('initial')}
            onSuccess={() => setResetScreen('success')}
            requestNewVerificationCode={requestNewVerificationCode}
            resetPasswordWithVerificationCode={
              resetPasswordWithVerificationCode
            }
            setIsRequestResetPassword={setIsRequestResetPassword}
            languageModel={languageModel}
            phoneNumber={phoneNumber}
            username={username}
            sendMethod={sendMethod}
            setIsShowLoadingIndicator={setIsShowLoadingIndicator}
          />
        ) : resetScreen === 'success' ? (
          <ResetPasswordSuccessPage
            windowWidth={windowWidth}
            twoFAInfo={twoFAInfo}
            verifyUser2FA={verifyUser2FA}
            redirectBackToLoginPage={redirectBackToLoginPage}
            isUserSetup2FA={isUserSetup2FA}
            gotoLoginScreen={gotoLoginScreen}
          />
        ) : (
          <RequestResetPasswordForm
            windowWidth={windowWidth}
            gotoLoginScreen={gotoLoginScreen}
            languageModel={languageModel}
            requestResetPasswordEmail={requestResetPasswordEmail}
            requestResetPasswordPhoneNumber={requestResetPasswordPhoneNumber}
            proceedToOTP={() => setResetScreen('combined')}
            email={email}
            setEmail={setEmail}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            username={username}
            setUsername={setUsername}
            resetMethod={resetMethod}
            setResetMethod={setResetMethod}
            sendMethod={sendMethod}
            setSendMethod={setSendMethod}
            setIsShowLoadingIndicator={setIsShowLoadingIndicator}
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

function RequestResetPasswordForm({
  windowWidth,
  gotoLoginScreen,
  languageModel,
  requestResetPasswordEmail,
  proceedToOTP,
  requestResetPasswordPhoneNumber,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  username,
  setUsername,
  resetMethod,
  setResetMethod,
  sendMethod,
  setSendMethod,
  setIsShowLoadingIndicator,
}) {
  const requestReset = async () => {
    const language = await AsyncStorage.getItem(Constants.LANGUAGE);
    const languageInJson = JSON.parse(language);
    const currentLanguage = languageInJson
      ? languageInJson.acceptLanguage
      : languageModel.acceptLanguage;

    if (!username) {
      ToastMessageErrorMultiLine({
        text1: translationString.missingUsername,
        text1NumberOfLines: 2,
      });
      return;
    }

    if (resetMethod === 'email' && !email) {
      ToastMessageErrorMultiLine({
        text1: translationString.missingEmail,
        text1NumberOfLines: 2,
      });
      return;
    }

    if (resetMethod === 'phoneNumber' && !phoneNumber) {
      ToastMessageErrorMultiLine({
        text1: translationString.missingPhoneNumber,
        text1NumberOfLines: 2,
      });
      return;
    }

    if (resetMethod === 'email') {
      requestResetPasswordEmail(email, username, ADMIN_URL, currentLanguage);
    } else {
      console.log(
        `Requesting OTP via ${resetMethod} for user ${username} at ${phoneNumber}`,
      );
      await requestResetPasswordPhoneNumber(
        phoneNumber,
        username,
        sendMethod,
        currentLanguage,
      )
        .then(() => {
          ToastMessageMultiLine({
            text1: translationString.passwordRequestVerificationCodeSuccess,
            text1NumberOfLines: 2,
          });
          proceedToOTP();
        })
        .catch((err) => {
          const errorMessage =
            err.response.data.errors == 'phoneResetUnavailableRegion'
              ? translationString.phoneResetUnavailableRegion
              : err.response.data.errors ||
                translationString.passwordResetFail3;

          ToastMessageErrorMultiLine({
            text1: errorMessage,
            text1NumberOfLines: 2,
          });
        })
        .finally(() => {
          setIsShowLoadingIndicator(false);
        });
    }
  };

  const back = () => {
    setUsername('');
    setEmail('');
    setPhoneNumber('');
    gotoLoginScreen();
  };

  return (
    <ScrollView style={[styles.content, {width: windowWidth}]}>
      <View>
        <Text style={styles.twoFALabel}>{translationString.resetPassword}</Text>
        <Text style={styles.twoFALabel}>
          {translationString.requestPasswordResetSubHeader}
        </Text>
      </View>

      <View style={styles.verificationCodeContainer}>
        <Text style={styles.verificationCodeText}>
          {translationString.username}
        </Text>
        <View style={styles.sixDigitContainer}>
          <TextInput
            value={username}
            onChangeText={(text) => setUsername(text)}
            style={styles.sixDigitInput}
          />
        </View>

        <Text style={[styles.verificationCodeText, {marginTop: 20}]}>
          {translationString.resetMethod}:
        </Text>
        <View style={styles.resetMethodContainer}>
          <TouchableOpacity
            style={[
              styles.resetMethodButton,
              resetMethod === 'email' && styles.resetMethodButtonActive,
            ]}
            onPress={() => setResetMethod('email')}>
            <Text
              style={[
                styles.resetMethodText,
                resetMethod === 'email' && styles.resetMethodTextActive,
              ]}>
              {translationString.email}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.resetMethodButton,
              resetMethod === 'phoneNumber' && styles.resetMethodButtonActive,
            ]}
            onPress={() => setResetMethod('phoneNumber')}>
            <Text
              style={[
                styles.resetMethodText,
                resetMethod === 'phoneNumber' && styles.resetMethodTextActive,
              ]}>
              {translationString.phoneNumber}
            </Text>
          </TouchableOpacity>
        </View>

        {resetMethod === 'email' ? (
          <>
            <Text style={[styles.verificationCodeText, {marginTop: 15}]}>
              {translationString.email}:
            </Text>
            <View style={styles.sixDigitContainer}>
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.sixDigitInput}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.verificationCodeText, {marginTop: 20}]}>
              {translationString.sendMethod}:
            </Text>
            <View style={styles.resetMethodContainer}>
              <TouchableOpacity
                style={[
                  styles.resetMethodButton,
                  sendMethod === 'sms' && styles.resetMethodButtonActive,
                ]}
                onPress={() => setSendMethod('sms')}>
                <Text
                  style={[
                    styles.resetMethodText,
                    sendMethod === 'sms' && styles.resetMethodTextActive,
                  ]}>
                  SMS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.resetMethodButton,
                  sendMethod === 'whatsapp' && styles.resetMethodButtonActive,
                ]}
                onPress={() => setSendMethod('whatsapp')}>
                <Text
                  style={[
                    styles.resetMethodText,
                    sendMethod === 'whatsapp' && styles.resetMethodTextActive,
                  ]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.verificationCodeText, {marginTop: 15}]}>
              {translationString.phoneNumber}:
            </Text>
            <View style={styles.sixDigitContainer}>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text)}
                keyboardType="phone-pad"
                style={styles.sixDigitInput}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
          </>
        )}

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
            onPress={() => requestReset()}>
            <Text style={[styles.loginButtonText]}>
              {translationString.requestResetLink}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function CombinedOTPPasswordForm({
  windowWidth,
  goBack,
  onSuccess,
  requestNewVerificationCode,
  phoneNumber,
  username,
  sendMethod,
  languageModel,
  resetPasswordWithVerificationCode,
  setIsShowLoadingIndicator,
}) {
  const currentLanguage = languageModel.acceptLanguage;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const inputRefs = useRef([]);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [canRequestNewOtp, setCanRequestNewOtp] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setTimeRemaining(180);
    setCanRequestNewOtp(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setCanRequestNewOtp(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const requestNewOtp = () => {
    if (canRequestNewOtp) {
      requestNewVerificationCode(
        phoneNumber,
        username,
        sendMethod,
        currentLanguage,
      )
        .then(() => {
          startTimer();
          ToastMessageMultiLine({
            text1: translationString.otpResent,
            text1NumberOfLines: 2,
          });
        })
        .catch((err) => {
          const errorMessage =
            err.response.data.errors || translationString.otpRequestFail;

          ToastMessageErrorMultiLine({
            text1: errorMessage,
            text1NumberOfLines: 2,
          });
        });
    }
  };

  const validatePassword = (password) => {
    // Regex: At least one uppercase, one digit, one special character, min length 10
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-=+\[\]{}|;:'",.<>?/~\\]).{10,}$/;
    return passwordPattern.test(password);
  };

  const submitForm = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      ToastMessageErrorMultiLine({
        text1: translationString.invalidOTP,
        text1NumberOfLines: 2,
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      ToastMessageErrorMultiLine({
        text1: translationString.enterAllFields,
        text1NumberOfLines: 2,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      ToastMessageErrorMultiLine({
        text1: translationString.passwordsDoNotMatch,
        text1NumberOfLines: 2,
      });
      return;
    }

    if (newPassword.length < 10) {
      ToastMessageErrorMultiLine({
        text1: translationString.passwordRequirementCheck1,
        text1NumberOfLines: 2,
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      ToastMessageErrorMultiLine({
        text1: translationString.passwordRequirementCheck2,
        text1NumberOfLines: 2,
      });
      return;
    }

    console.log('Verifying OTP:', otpString);
    console.log('Resetting password');

    await resetPasswordWithVerificationCode(
      phoneNumber,
      username,
      otpString,
      newPassword,
      sendMethod,
      currentLanguage,
    )
      .then(() => {
        onSuccess();
      })
      .catch((err) => {
        const errorMessage =
          err.response.data.errors || translationString.passwordResetFail;

        ToastMessageErrorMultiLine({
          text1: errorMessage,
          text1NumberOfLines: 2,
        });
      })
      .finally(() => {
        setIsShowLoadingIndicator(false);
      });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ScrollView style={[styles.content, {width: windowWidth}]}>
      <View>
        <Text style={styles.twoFALabel}>{translationString.resetPassword}</Text>
        <Text style={styles.twoFASubLabel}>
          {translationString.enterOtpAndPasswordMessage}
        </Text>
      </View>

      <View style={styles.verificationCodeContainer}>
        <Text style={styles.verificationCodeText}>
          {translationString.enterOTP}:
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.timerText}>
            {canRequestNewOtp
              ? translationString.didntReceiveOTP
              : `${translationString.canRequestNewOtpIn} ${formatTime(
                  timeRemaining,
                )}`}
          </Text>
          <TouchableOpacity
            onPress={requestNewOtp}
            disabled={!canRequestNewOtp}
            style={[
              styles.resendButton,
              !canRequestNewOtp && styles.resendButtonDisabled,
            ]}>
            <Text
              style={[
                styles.resendButtonText,
                !canRequestNewOtp && styles.resendButtonTextDisabled,
              ]}>
              {translationString.resendOTP}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.verificationCodeText, {marginTop: 20}]}>
          {translationString.newPassword}:
        </Text>
        <View style={styles.sixDigitContainer}>
          <TextInput
            value={newPassword}
            onChangeText={(text) => setNewPassword(text)}
            style={styles.sixDigitInput}
            secureTextEntry
          />
        </View>

        <Text style={[styles.verificationCodeText, {marginTop: 15}]}>
          {translationString.confirmPassword}:
        </Text>
        <View style={styles.sixDigitContainer}>
          <TextInput
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            style={styles.sixDigitInput}
            secureTextEntry
          />
        </View>

        <View style={styles.twoFAButtonContainer}>
          <TouchableOpacity
            style={[styles.twoFAButton, styles.twoFASecondaryButton]}
            onPress={goBack}>
            <Text style={[styles.loginButtonText, styles.whiteText]}>
              {translationString.back}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.twoFAButton]} onPress={submitForm}>
            <Text style={[styles.loginButtonText]}>
              {translationString.resetPassword}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function ResetPasswordSuccessPage({windowWidth, gotoLoginScreen}) {
  const back = () => {
    gotoLoginScreen();
  };

  return (
    <ScrollView style={[styles.content, {width: windowWidth}]}>
      <View>
        <Text style={styles.twoFALabel}>
          {translationString.passwordResetSuccess}
        </Text>
        <Text style={styles.twoFALabel}>
          {translationString.passwordResetSuccessMessage}
        </Text>
      </View>

      <View style={styles.verificationCodeContainer}>
        <View style={styles.twoFAButtonContainer}>
          <TouchableOpacity
            style={[styles.twoFAButton, styles.twoFASecondaryButton]}
            onPress={() => back()}>
            <Text style={[styles.loginButtonText, styles.whiteText]}>
              {translationString.backToLogin}
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
    borderBottomColor: 'white',
    color: 'white',
    borderBottomWidth: 2,
  },
  twoFAButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
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
  resetMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  resetMethodButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  resetMethodButtonActive: {
    backgroundColor: 'white',
  },
  resetMethodText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resetMethodTextActive: {
    color: Constants.THEME_COLOR,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  resendContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  resendButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  resendButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  resendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resendButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
