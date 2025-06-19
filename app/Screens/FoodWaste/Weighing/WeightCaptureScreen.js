/* eslint-disable react-hooks/exhaustive-deps */
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import {translationString} from '../../../Assets/translation/Translation';
import * as Constants from '../../../CommonConfig/Constants';
import React, {useEffect, useState} from 'react';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {useJobBinManagement} from '../../../Hooks/JobList/JobBinManagement/useJobBinManagement';
import {useAllJobList} from '../../../Hooks/JobList/All/useAllJobList';

const WeightCaptureScreen = ({route, navigation}) => {
  const {
    job,
    sku,
    saveBinInformation,
    getBinInformation,
    checkIsBinExist,
    setJobInfo,
    getJobIdBySku,
    isJobBinExceedExpectedQuantity,
  } = useJobBinManagement(route, navigation);

  const {datalist} = useAllJobList(route, navigation);

  const [isWeightWithBin, setIsWeightWithBin] = useState(false);
  const [weight, setWeight] = useState('0');
  const [isJobAvailable, setIsJobAvailable] = useState(false);
  const [existingBinId, setExistingBinId] = useState();
  const [isBinExist, setIsBinExist] = useState(false);
  const translateX = useState(new Animated.Value(isWeightWithBin ? 45 : 5))[0];

  useEffect(() => {
    const fetchAndSetJobInfo = async () => {
      if (sku && job && !job.consignee && !job.destination) {
        try {
          const jobId = await getJobIdBySku(sku);

          const foundJob = datalist
            .filter((data) => data.status === 1)
            .find((data) => data.id === jobId);

          setJobInfo(foundJob);
        } catch (error) {
          console.error('Error fetching job ID:', error);
        }
      }
    };

    fetchAndSetJobInfo();
  }, [datalist, getJobIdBySku, job, setJobInfo, sku]);

  useEffect(() => {
    if (job && job.destination) {
      setIsJobAvailable(true);
    } else {
      setIsJobAvailable(false);
    }
  }, [job]);

  useEffect(() => {
    const fetchBinData = async () => {
      try {
        const binExists = await checkIsBinExist();

        if (binExists) {
          setIsBinExist(true);
          const binInfo = await getBinInformation();
          if (binInfo.length > 0) {
            const binWeight = binInfo[0].weight.toString();
            const binWeightIsWithBin = binInfo[0].withBin;
            const binId = binInfo[0].id;

            setExistingBinId(binId);
            setWeight(binWeight);
            setIsWeightWithBin(binWeightIsWithBin);
          }
        } else {
          setIsBinExist(false);
          if (
            job.customer &&
            !job.customer.isAllowOverCollect &&
            isJobBinExceedExpectedQuantity()
          ) {
            Alert.alert(
              translationString.exceededQuantity,
              translationString.scanBinForCorrectQuantity,
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ],
              {cancelable: false},
            );
          }
        }
      } catch (error) {
        console.error('Error fetching bin data:', error);
      }
    };

    if (job) {
      fetchBinData();
    }
  }, [job]);

  const navigateToSelectJobScreen = () => {
    navigation.navigate('SelectFoodWasteJobScreen', {
      jobList: datalist,
      onGoBack: setJobInfo,
    });
  };

  const handleChangeWeight = (value) => {
    const numbersOnly = value.replace(/[^0-9.]/g, '');
    const parsedNumber = parseFloat(numbersOnly);
    setWeight(isNaN(parsedNumber) ? 0 : parsedNumber);
  };

  const calculatenetWeight = () => {
    const binWeight =
      job && job.customer && job.customer.binWeight
        ? job.customer.binWeight
        : 10;
    const netWeight = isWeightWithBin ? weight - binWeight : weight;
    return netWeight < 0 ? 0 : netWeight;
  };

  const toggleSwitch = () => {
    setIsWeightWithBin((previousState) => !previousState);
    Animated.timing(translateX, {
      toValue: isWeightWithBin ? 5 : 45,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const onSubmitBinInfo = (isSubmit) => {
    const netWeight = calculatenetWeight();
    if (isBinExist) {
      saveBinInformation(
        weight,
        netWeight,
        isWeightWithBin,
        isSubmit,
        isBinExist,
        existingBinId,
      );
    } else {
      saveBinInformation(weight, netWeight, isWeightWithBin, isSubmit);
    }

    resetForm();
  };

  const resetForm = () => {
    setIsWeightWithBin(false);
    setWeight('0');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView style={styles.scrollViewflexGrow}>
          <View style={styles.infoContainer}>
            <View style={styles.paddingVertical20}>
              <Text style={styles.skuText}>SKU QR</Text>
              <Text style={styles.skuValue}>{sku}</Text>
            </View>
            <View style={styles.divider} />
            {isJobAvailable ? (
              <View style={styles.paddingVertical20}>
                <Text style={styles.jobIdText}>
                  {translationString.jobId}: {job.id}
                </Text>
                <ScrollView style={styles.addressScrollView}>
                  <Text style={styles.addressText}>{job.destination}</Text>
                </ScrollView>

                <Text style={styles.consigneeText}>
                  {translationString.consignee}: {job.consignee}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectJobToUpdateButton}
                onPress={navigateToSelectJobScreen}>
                <Text style={styles.selectJobToUpdateText}>
                  Select Job To Update
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.weightContainer}>
            <View style={styles.weightHeader}>
              <View style={styles.weightInfo}>
                <Text style={styles.weightLabel}>
                  {translationString.weightWithBin}?
                </Text>
                <Text style={styles.weightHint}>
                  {translationString.binWeight} ={' '}
                  {job && job.customer && job.customer.binWeight
                    ? job.customer.binWeight
                    : 10}{' '}
                  {translationString.kg}
                </Text>
              </View>
              <View>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    isWeightWithBin
                      ? styles.switchEnabled
                      : styles.switchDisabled,
                  ]}
                  onPress={toggleSwitch}
                  disabled={!isJobAvailable}
                  activeOpacity={0.8}>
                  <Text style={[styles.switchText, styles.paddingLeft5]}>
                    {isWeightWithBin ? translationString.yes : ''}
                  </Text>
                  <Animated.View
                    style={[styles.circle, {transform: [{translateX}]}]}
                  />
                  <Text style={[styles.switchText, styles.paddingRight5]}>
                    {!isWeightWithBin ? translationString.no : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.weightInputContainer}>
              <View style={styles.weightInputRow}>
                <Text style={styles.inputWeightText}>
                  {translationString.inputWeight}
                </Text>
                <Text style={styles.inputWeightHint}>
                  {translationString.perSingleBin}
                </Text>
              </View>
            </View>

            <View style={styles.weightInputView}>
              <TextInput
                value={weight}
                style={styles.inputText}
                onChangeText={handleChangeWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.netWeightContainer}>
          <View style={[styles.triangle, styles.triangleUp]} />
          <View style={styles.netWeightRow}>
            <Text style={styles.netWeightLabel}>
              {translationString.netWeight} =
            </Text>
            <Text style={styles.netWeightValue}>
              {calculatenetWeight()} {translationString.kg}
            </Text>
          </View>
        </View>
        <View style={styles.actionContainer}>
          <TouchableHighlight
            underlayColor={Constants.Light_Grey_Underlay}
            style={styles.submitButton}
            disabled={!isJobAvailable}
            onPress={() => onSubmitBinInfo(true)}>
            <Text style={styles.submitButtonText}>
              {translationString.submit}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={Constants.Light_Grey_Underlay}
            style={styles.saveButton}
            disabled={!isJobAvailable}
            onPress={() => onSubmitBinInfo(false)}>
            <Text style={styles.saveButtonText}>
              {translationString.saveScanNext}
            </Text>
          </TouchableHighlight>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WeightCaptureScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: Constants.THEME_COLOR,
    paddingHorizontal: 30,
  },
  weightContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  switch: {
    width: 70,
    height: 30,
    borderRadius: 20,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchEnabled: {
    backgroundColor: '#41c300',
  },
  switchDisabled: {
    backgroundColor: 'gray',
  },
  switchText: {
    color: 'white',
    fontWeight: 'bold',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: 'white',
    position: 'absolute',
    top: 5,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'darkgray',
    alignSelf: 'center',
    marginBottom: 5,
  },
  triangleUp: {
    transform: [{rotate: '180deg'}],
  },
  paddingVertical20: {
    paddingVertical: 20,
  },
  skuText: {
    color: Constants.WHITE,
    fontWeight: '700',
    fontSize: 20,
  },
  skuValue: {
    color: Constants.WHITE,
    fontWeight: '700',
    fontSize: 30,
  },
  divider: {
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  jobIdText: {
    marginBottom: 5,
    color: Constants.Dark_Grey,
  },
  addressText: {
    marginBottom: 5,
    color: Constants.WHITE,
    fontWeight: '500',
    fontSize: 30,
  },
  consigneeText: {
    color: Constants.WHITE,
  },
  weightHeader: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  weightLabel: {
    color: Constants.THEME_COLOR,
    fontSize: 20,
  },
  weightHint: {
    color: 'gray',
    fontSize: 15,
    fontStyle: 'italic',
  },
  weightInputContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  weightInputRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  inputWeightText: {
    paddingHorizontal: 5,
    fontSize: 20,
  },
  inputWeightHint: {
    paddingHorizontal: 5,
    fontSize: 13,
    color: 'gray',
    fontStyle: 'italic',
  },
  weightInputView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  inputText: {
    fontSize: 100,
    fontWeight: '300',
  },
  netWeightContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  netWeightRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  netWeightLabel: {
    paddingHorizontal: 5,
    fontSize: 20,
  },
  netWeightValue: {
    paddingHorizontal: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  paddingLeft5: {
    paddingLeft: 5,
  },
  paddingRight5: {
    paddingRight: 5,
  },
  submitButton: {
    backgroundColor: '#41c300',
    flex: 1,
    paddingVertical: 15,
  },
  submitButtonText: {
    color: Constants.WHITE,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
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
  addressScrollView: {
    maxHeight: 90,
  },
  flex: {
    flex: 1,
  },
  scrollViewflexGrow: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
  },
  selectJobToUpdateButton: {
    backgroundColor: Constants.WHITE,
    padding: 25,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: 'rgba(0,0,0, .4)',
    shadowOffset: {height: 1, width: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 6,
  },
  selectJobToUpdateText: {
    textAlign: 'center',
    color: Constants.THEME_COLOR,
    fontSize: 25,
  },
});
