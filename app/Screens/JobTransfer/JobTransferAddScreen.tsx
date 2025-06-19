import React, {useLayoutEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {JobTransferAddProps} from '../../NavigationStacks/JobTransferStack';
import {useJobTransferAdd} from './../../Hooks/JobTransfer/useJobTransferAdd';
import * as Constants from '../../CommonConfig/Constants';
import {ImageRes} from '../../Assets';
import DropDownPicker from 'react-native-dropdown-picker';
import {TextInput} from 'react-native-gesture-handler';
import {translationString} from '../../Assets/translation/Translation';
import {useState} from 'react';

export const JobTransferJobAddScreen = ({
  route,
  navigation,
}: JobTransferAddProps): JSX.Element => {
  const [isShowReasonDropdown, setIsShowReasonDropdown] = useState(true);
  const [isShowDriverDropdown, setIsShowDriverDropdown] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={ImageRes.BackButton} />
        </TouchableOpacity>
      ),
      headerTitle: translationString.job_transfers.request_details,
    });
  }, [navigation]);

  const {
    openReasonDropdown,
    openDriverDropdown,
    selectedReason,
    parcelQty,
    selectedJobCount,
    driverList,
    selectedDriver,
    reasons,
    setOpenReasonDropdown,
    setOpenDriverDropdown,
    setSelectedReason,
    setSelectedDriver,
    setDriverList,
    setReasons,
    onParcelQtyChange,
    selectJob,
    summary,
  } = useJobTransferAdd(route, navigation);

  const setZIndex = () => {
    if (Platform.OS === 'ios') {
      return {
        height: 120,
        zIndex: 2,
      };
    } else {
      return {
        height: 120,
      };
    }
  };

  return (
    <View style={styles.baseContainer}>
      <View style={[styles.container]}>
        <View style={{justifyContent: 'flex-start', height: '100%'}}>
          <View style={{height: 120}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>
                {translationString.job_transfers.request_transfer_job}
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    paddingLeft: 15,
                    color: Constants.THEME_COLOR,
                    fontWeight: 'bold',
                  },
                ]}>
                {selectedJobCount}
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => selectJob()}>
              <Text style={styles.input}>
                {translationString.job_transfers.select_job}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={setZIndex()}>
            {/* TODO translate */}
            <Text style={styles.text}>
              {translationString.job_transfers.swapDriver}
            </Text>
            {isShowDriverDropdown && (
              <DropDownPicker
                style={[styles.input, {zIndex: 10}]}
                textStyle={{
                  fontSize: 18,
                  color: Constants.THEME_COLOR,
                  fontWeight: '600',
                }}
                onOpen={() => {
                  setIsShowReasonDropdown(false);
                  Keyboard.dismiss();
                }}
                onClose={() => {
                  setIsShowDriverDropdown(true);
                  setIsShowReasonDropdown(true);
                  Keyboard.dismiss();
                }}
                searchable={true}
                searchPlaceholder={translationString.search}
                placeholder={translationString.job_transfers.selectDriver}
                open={openDriverDropdown}
                value={selectedDriver}
                items={driverList}
                setOpen={setOpenDriverDropdown}
                setValue={setSelectedDriver}
                setItems={setDriverList}
              />
            )}
          </View>
          <View style={{height: 120, zIndex: 1}}>
            <Text style={styles.text}>
              {translationString.job_transfers.parcel_quantity}
            </Text>
            <TextInput
              underlineColorAndroid="transparent"
              style={styles.input}
              value={parcelQty}
              onChangeText={onParcelQtyChange}
              keyboardType="numeric"></TextInput>
          </View>
          <View style={{height: 120}}>
            <Text style={styles.text}>
              {translationString.job_transfers.transfer_reason}
            </Text>
            {isShowReasonDropdown && (
              <DropDownPicker
                style={styles.input}
                textStyle={{
                  fontSize: 18,
                  color: Constants.THEME_COLOR,
                  fontWeight: '600',
                }}
                onOpen={() => {
                  setIsShowDriverDropdown(false);
                  Keyboard.dismiss();
                }}
                onClose={() => {
                  setIsShowDriverDropdown(true);
                  setIsShowReasonDropdown(true);
                  Keyboard.dismiss();
                }}
                placeholder={translationString.job_transfers.selectReason}
                open={openReasonDropdown}
                value={selectedReason}
                items={reasons}
                setOpen={setOpenReasonDropdown}
                setValue={setSelectedReason}
                setItems={setReasons}
              />
            )}
          </View>
        </View>
        <View style={{flex: 1}} />
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: Constants.Failed_Color},
          ]}
          onPress={() => {
            navigation.pop();
          }}>
          <Text style={styles.confirmText}>{translationString.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: Constants.Completed_Color},
          ]}
          onPress={() => summary()}>
          <Text style={styles.confirmText}>{translationString.next_btn}</Text>
        </TouchableOpacity>
      </View>
    </View>
    // <SafeAreaView style={styles.baseContainer}>

    // </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    display: 'flex',
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    justifyContent: 'flex-start',
  },
  input: {
    backgroundColor: 'white',
    color: Constants.THEME_COLOR,
    fontWeight: '700',
    fontSize: 18,
    elevation: 5,
    height: 50,
    borderWidth: 0,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 1,
    padding: 10,
  },
  button: {
    backgroundColor: 'transparent',
    color: Constants.THEME_COLOR,
    fontSize: Constants.buttonFontSize,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
  text: {
    fontFamily: Constants.fontFamily,
    fontSize: 22,
    paddingBottom: 5,
  },
  bottomContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
});
