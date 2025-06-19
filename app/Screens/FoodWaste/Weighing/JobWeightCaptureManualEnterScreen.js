/* eslint-disable react-hooks/exhaustive-deps */
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {translationString} from '../../../Assets/translation/Translation';
import * as Constants from '../../../CommonConfig/Constants';
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import BackButton from '../../../Assets/image/icon_back_white.png';
import ScanQRButton from '../../../Assets/image/icon_scan_qr.png';

const JobWeightCaptureManualEnterScreen = ({route, navigation}) => {
  const [sku, setSku] = useState('');
  const [skuId, setSkuId] = useState('');
  const [isBlankError, setIsBlankError] = useState(false);
  const [option, setOption] = useState('normal');

  useEffect(() => {
    if (route.params.sku) {
      setSku(route.params.sku);
    }

    if (route.params.skuId) {
      setSkuId(route.params.skuId);
    }
  }, [route.params.sku, route.params.skuId]);

  useEffect(() => {
    if (route.params.option) {
      setOption(route.params.option);
    }
  }, [route.params.option]);

  const onSubmit = () => {
    if (!sku) {
      setIsBlankError(true);
      return;
    }

    setIsBlankError(false);

    const [submitSku, submitSkuId] = [sku, skuId];

    setSku('');
    setSkuId('');

    navigateToWeightCapture(submitSku, submitSkuId);
  };

  const navigateToWeightCapture = (submitSku, submitSkuId) => {
    const baseParams = {
      skuId: submitSkuId,
      sku: submitSku,
      option,
    };

    const screenName = option === 'fail' ? 'FailQRScreen' : 'WeightCapture';

    const params = {
      ...baseParams,
      ...(option !== 'batch' && {job: route.params.job}),
    };

    navigation.navigate(screenName, params);
  };

  const renderHeaderTitle = () => {
    switch (option) {
      case 'normal': {
        return translationString.weightCapture;
      }
      case 'fail': {
        return translationString.failureBinCapture;
      }
      case 'batch': {
        return translationString.batchWeightCapture;
      }
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle(),
      headerLeft: () => {
        return (
          <TouchableOpacity
            style={{marginLeft: 16, height: 24}}
            onPress={() => {
              navigation.goBack();
            }}>
            <Image source={BackButton} />
          </TouchableOpacity>
        );
      },
      headerRight: () => {
        return (
          <TouchableOpacity
            style={{marginRight: 16, height: 24}}
            onPress={() => {
              navigation.navigate('WeightCaptureScanQR', {
                job: route.params.job,
                option: option,
              });
            }}>
            <Image source={ScanQRButton} />
          </TouchableOpacity>
        );
      },
      animationEnabled: false,
    });
  }, [navigation, option]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView style={styles.scrollViewFlexGrow}>
          <View style={styles.inputContainer}>
            <Text style={styles.headerText}>
              {translationString.pleaseInputYour}
            </Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.labelText}>SKU</Text>
              <TextInput
                value={sku}
                onChangeText={setSku}
                style={styles.input}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.labelText}>ID</Text>
              <TextInput
                value={skuId}
                onChangeText={setSkuId}
                style={styles.input}
              />
            </View>

            {isBlankError && (
              <Text style={styles.blankErrorMessage}>
                {translationString.emptySkuOrIdError}
              </Text>
            )}
          </View>
        </ScrollView>
        <View style={styles.actionContainer}>
          <TouchableHighlight
            underlayColor={Constants.Light_Grey_Underlay}
            style={styles.saveButton}
            onPress={onSubmit}>
            <Text style={styles.saveButtonText}>
              {translationString.next_btn}
            </Text>
          </TouchableHighlight>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default JobWeightCaptureManualEnterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
  },
  flex: {
    flex: 1,
  },
  scrollViewFlexGrow: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 50,
    paddingTop: 50,
  },
  headerText: {
    textAlign: 'center',
    color: Constants.THEME_COLOR,
    fontSize: 25,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 50,
  },
  labelText: {
    textAlign: 'center',
    color: Constants.THEME_COLOR,
    fontSize: 25,
    marginBottom: 3,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderRadius: 10,
    fontSize: 40,
    color: 'black',
    margin: 5,
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: Constants.THEME_COLOR,
    flex: 1,
    paddingVertical: 15,
  },
  saveButtonText: {
    color: Constants.WHITE,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  blankErrorMessage: {
    textAlign: 'center',
    color: 'red',
    fontWeight: '700',
    fontSize: 20,
  },
});
