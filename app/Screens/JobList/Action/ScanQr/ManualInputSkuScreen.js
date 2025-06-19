import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import {useManualInputSku} from '../../../../Hooks/JobList/Action/ScanQr/useManualInputSku';
import {translationString} from '../../../../Assets/translation/Translation';
import * as Constants from '../../../../CommonConfig/Constants';

export default ({route, navigation}) => {
  const {
    onCancelSkipSkuClicked,
    skuInputText,
    skuError,
    onChangeSkuText,
    onInputSkuConfirmClicked,
    hasError,
    input,
  } = useManualInputSku(route, navigation);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.container}
        onLayout={(e) => {
          const {width, height} = e.nativeEvent.layout;
          setWidth(width);
          setHeight(height);
        }}>
        <View style={styles.whiteBackground}>
          <View style={styles.view}>
            <Text style={styles.title}>{translationString.password_input}</Text>
            <View style={styles.divider} />
            <Text>{translationString.please_input_sku}</Text>
            <TextInput
              ref={input}
              style={[
                styles.textInput,
                {
                  color: skuError !== '' ? 'red' : 'black',
                  borderColor: skuError !== '' ? 'red' : 'transparent',
                },
              ]}
              onChangeText={(text) => {
                onChangeSkuText(text);
              }}
              value={skuInputText}
              autoCapitalize={'none'}
              onSubmitEditing={() => {
                onInputSkuConfirmClicked(skuInputText);
              }}
              autoFocus={true}
            />
            <Text style={styles.errorText}>{skuError}</Text>
            <View style={[styles.bottomButtonContainer, {width: '100%'}]}>
              <TouchableOpacity
                underlayColor={Constants.Light_Grey_Underlay}
                style={[styles.cancelButtonContainer, {width: width * 0.5}]}
                onPress={() => {
                  onCancelSkipSkuClicked();
                }}>
                <Text style={styles.cancelButton}>
                  {translationString.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                underlayColor={
                  hasError ? Constants.Red_Underlay : Constants.Green_Underlay
                }
                style={[
                  hasError
                    ? styles.confirmFailButtonContainer
                    : styles.confirmButtonContainer,
                  {width: width * 0.5},
                ]}
                onPress={() => onInputSkuConfirmClicked(skuInputText)}>
                <Text style={styles.confirmButton}>
                  {translationString.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  whiteBackground: {
    flex: 1,
    backgroundColor: 'white',
  },
  view: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    color: Constants.Dark_Grey,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  confirmButtonContainer: {
    width: Constants.screenWidth / 2,
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmFailButtonContainer: {
    width: Constants.screenWidth / 2,
    backgroundColor: Constants.Failed_Color,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmButton: {
    fontSize: 18,
    color: Constants.WHITE,
    alignSelf: 'center',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  topContainer: {
    flex: 0,
    width: Constants.screenWidth,
    flexDirection: 'row',
  },
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: Constants.THEME_COLOR,
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: Constants.NoboSansBoldFont,
    borderRadius: 8,
    backgroundColor: Constants.Light_Grey,
    fontSize: Constants.buttonFontSize,
    marginHorizontal: 24,
    marginVertical: 8,
  },
  cancelButtonContainer: {
    width: Constants.screenWidth / 2,
    justifyContent: 'center',
    backgroundColor: Constants.Light_Grey,
    alignItems: 'center',
    padding: 24,
  },
  cancelButton: {
    fontSize: 18,
    color: Constants.Dark_Grey,
    alignSelf: 'center',
    textAlign: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    color: 'red',
    marginBottom: 48,
  },
});
