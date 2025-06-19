/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {translationString} from '../../../Assets/translation/Translation';
import * as Constants from '../../../CommonConfig/Constants';
import {useJobBinManagement} from '../../../Hooks/JobList/JobBinManagement/useJobBinManagement';

const reasons = [
  {id: '1', name: translationString.contaminatedWaste},
  {id: '2', name: translationString.overfilledBin},
  {id: '3', name: translationString.inaccessibleLocation},
  {id: '4', name: translationString.other},
];

const FailQRScreen = ({route, navigation}) => {
  const {job, sku, getBinInformation, checkIsBinExist, onRejectBin} =
    useJobBinManagement(route, navigation);
  const [activeButtonIndex, setActiveButtonIndex] = useState();
  const [weight, setWeight] = useState('0');
  const [validationError, setValidationError] = useState('');

  const [existingBinId, setExistingBinId] = useState();
  const [otherReason, setOtherReason] = useState('');

  const isFormValid =
    activeButtonIndex !== undefined &&
    (activeButtonIndex !== 3 || otherReason.trim() !== '');

  useEffect(() => {
    const fetchBinData = async () => {
      try {
        const binExists = await checkIsBinExist();

        if (binExists) {
          const binInfo = await getBinInformation();
          if (binInfo.length > 0) {
            const binWeight = binInfo[0].weight.toString();
            const binId = binInfo[0].id;
            setExistingBinId(binId);
            setWeight(binWeight);
          }
        } else {
          Alert.alert(
            translationString.binNotFound,
            translationString.pleaseScanAgain,
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
          //
        }
      } catch (error) {
        console.error('Error fetching bin data:', error);
      }
    };

    fetchBinData();
  }, []);

  const onRejectBinInfo = (isSubmit) => {
    if (
      activeButtonIndex === undefined ||
      (activeButtonIndex === 3 && !otherReason.trim())
    ) {
      setValidationError(translationString.pleaseSelectReason);
      return;
    }

    setValidationError('');
    const reasonMessage =
      activeButtonIndex === 3 ? otherReason : reasons[activeButtonIndex].name;
    onRejectBin(reasonMessage, existingBinId, isSubmit);
  };

  const reasonButton = (item, index) => (
    <TouchableOpacity
      onPress={() => setActiveButtonIndex(index)}
      style={[
        styles.reasonButton,
        activeButtonIndex === index
          ? styles.activeReasonButton
          : styles.inactiveReasonButton,
      ]}>
      <Text style={styles.reasonButtonText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.infoHeaderContainer}>
          <View style={styles.infoHeader}>
            <Text style={styles.skuText}>{translationString.failedSku}</Text>
            <Text style={styles.skuValue}>{sku}</Text>
          </View>
          <View style={styles.infoHeader}>
            <Text style={styles.skuText}>{translationString.weight}</Text>
            <Text style={styles.skuValue}>
              {weight} {translationString.kg.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.skuText}>
          {translationString.jobId}: {job.id}
        </Text>
        <ScrollView style={styles.addressScrollView}>
          <Text style={styles.addressText}>{job.destination}</Text>
        </ScrollView>
        <Text style={styles.skuText}>
          {translationString.consignee}: {job.consignee}
        </Text>
      </View>

      <View style={styles.reasonsContainer}>
        <Text style={styles.reasonsHeader}>
          {translationString.pleaseChooseAReason}:{' '}
          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : null}
        </Text>

        <FlatList
          data={reasons}
          keyExtractor={(item) => item.id}
          renderItem={({item, index}) => reasonButton(item, index)}
        />
        {activeButtonIndex === 3 && (
          <View style={styles.othersInputContainer}>
            <TextInput
              placeholder={translationString.pleaseDescribe}
              value={otherReason}
              onChangeText={(text) => setOtherReason(text)}
            />
          </View>
        )}
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.disabledButton]}
          onPress={() => onRejectBinInfo(true)}
          disabled={!isFormValid}>
          <Text
            style={[
              styles.submitButtonText,
              !isFormValid && styles.disabledButtonText,
            ]}>
            {translationString.submit}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, !isFormValid && styles.disabledButton]}
          onPress={() => onRejectBinInfo(false)}
          disabled={!isFormValid}>
          <Text
            style={[
              styles.saveButtonText,
              !isFormValid && styles.disabledButtonText,
            ]}>
            {translationString.scanNextFailureItem}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FailQRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: '#E54823',
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 250,
  },
  infoHeaderContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoHeader: {
    display: 'flex',
    flexDirection: 'column',
  },
  skuText: {
    color: Constants.WHITE,
    fontSize: 15,
  },
  skuValue: {
    color: Constants.WHITE,
    fontWeight: '700',
    fontSize: 30,
  },
  addressScrollView: {
    maxHeight: 90,
    marginTop: 10,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 20,
    color: Constants.WHITE,
  },
  reasonsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 20,
  },
  reasonsHeader: {
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 17,
  },
  reasonButton: {
    padding: 15,
    borderRadius: 5,
    shadowColor: 'rgba(0,0,0, .4)',
    shadowOffset: {height: 1, width: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 6,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  activeReasonButton: {
    backgroundColor: '#41c300',
  },
  inactiveReasonButton: {
    backgroundColor: Constants.WHITE,
  },
  reasonButtonText: {
    fontSize: 17,
  },
  othersInputContainer: {
    borderRadius: 5,
    marginHorizontal: 20,
    backgroundColor: 'white',
    shadowColor: 'rgba(0,0,0, .4)',
    shadowOffset: {height: 1, width: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 6,
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  errorText: {
    color: 'red',
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 14,
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
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
});
