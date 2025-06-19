/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import LottieView from 'lottie-react-native';
import * as Constants from '../../CommonConfig/Constants';
import {useSelector, useDispatch} from 'react-redux';
import {createAction} from '../../Actions/CreateActions';
import * as ActionType from '../../Actions/ActionTypes';
import {translationString} from '../../Assets/translation/Translation';
import LottieFile from '../../Assets/lottie/epod.json';
import {useLoginModal} from './useLoginModal';
import CustomAlertView from '../CustomAlertView';

const LoginModal = ({isShowLoginModal}) => {
  const {
    dismissLoginModal,
    loginButtonOnPress,
    setPassword,
    setContentHeight,
    userModel,
    password,
    alertMsg,
    isShowLoadingIndicator,
    loadingText,
    contentHeight,
  } = useLoginModal();
  return (
    <Modal animationType="fade" transparent={true} visible={isShowLoginModal}>
      <View style={styles.darkBackground}>
        <View
          style={[styles.content, {height: contentHeight}]}
          onLayout={(event) => {
            const {x, y, width, height} = event.nativeEvent.layout;
            if (height > contentHeight) {
              setContentHeight(height);
            }
          }}>
          {isShowLoadingIndicator ? (
            <>
              <LottieView
                style={{alignSelf: 'center'}}
                source={LottieFile}
                autoSize
                autoPlay
                loop
              />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                {translationString.session_expired_login}
              </Text>
              <Text style={styles.label}>{translationString.username}</Text>
              <TextInput
                style={[styles.textInput, {color: Constants.Pending_Color}]}
                onChangeText={() => {}}
                value={userModel.username ? userModel.username : ''}
                autoCapitalize={'none'}
                editable={false}
              />
              <Text style={styles.label}>{translationString.password}</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => {
                  setPassword(text);
                }}
                value={password}
                autoCapitalize={'none'}
                secureTextEntry={true}
              />
              <View style={styles.horizontalContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={dismissLoginModal}>
                  <Text style={styles.modalCancelButtonText}>
                    {translationString.cancel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={loginButtonOnPress}>
                  <Text style={styles.modalButtonText}>
                    {translationString.login}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        {alertMsg !== '' && <CustomAlertView alertMsg={alertMsg} />}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: Constants.screenWidth - 60,
    marginVertical: hp('15%'),
    justifyContent: 'center',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.Pending_Color,
    textAlign: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },
  label: {
    fontSize: Constants.normalFontSize,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.Pending_Color,
    marginTop: 10,
  },
  textInput: {
    color: 'black',
    borderBottomColor: Constants.Pending_Color,
    borderBottomWidth: 1,
    fontSize: Constants.textInputFonSize,
    height: 48,
    fontFamily: Constants.NoboSansBoldFont,
    marginBottom: 10,
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    marginLeft: 20,
    paddingHorizontal: 25,
    paddingVertical: 8,
  },
  modalCancelButtonText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: Constants.Pending_Color,
  },
  modalButtonText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: Constants.THEME_COLOR,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: Constants.fontFamily,
    alignSelf: 'center',
  },
});

export default LoginModal;
