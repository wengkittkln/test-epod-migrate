import React, {useLayoutEffect, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import * as Constants from '../../../../CommonConfig/Constants';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translationString} from '../../../../Assets/translation/Translation';
import CustomAlertView from '../../../../Components/CustomAlertView';
import CompleteIcon from '../../../../Assets/image/icon_success.png';
import {useSelectReason} from '../../../../Hooks/JobList/Action/Reason/useSelectReason';
import PhotoHorizontalFlatList from '../../../../Components/PhotoHorizontalFlatList/PhotoHorizontalFlatList';
import LoadingModal from '../../../../Components/LoadingModal';

export default ({route, navigation}) => {
  const reasonType = route.params.reasonType;
  const {
    datalist,
    selectedReasonId,
    otherReason,
    otherReasonId,
    partialDeliveryID,
    alertMsg,
    scanQrResult,
    scanQRReasonId,
    otherReasonOnChangeText,
    itemOnPressed,
    confirmButtonOnPressed,
    gotoCameraScreen,
    scannedQRContentOnChangeText,
  } = useSelectReason(route, navigation);

  const [isLoading, setLoading] = useState(false);

  const handleButtonClick = async () => {
    setLoading(true);
    await confirmButtonOnPressed();
    setLoading(false);
  };

  return (
    <>
      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading2}
      />
      <KeyboardAwareScrollView>
        <View style={styles.baseContainer}>
          <FlatList
            style={styles.flatlist}
            data={datalist}
            renderItem={({item, index}) => (
              <View>
                <Pressable
                  onPress={() => itemOnPressed(item.id, item)}
                  style={
                    selectedReasonId === item.id
                      ? styles.reasonActiveItemContainer
                      : styles.reasonInactiveItemContainer
                  }>
                  <Text
                    style={
                      selectedReasonId === item.id
                        ? styles.reasonActiveText
                        : styles.reasonInactiveText
                    }>
                    {item.description}
                  </Text>
                </Pressable>
                {selectedReasonId === otherReasonId &&
                  item.id === otherReasonId && (
                    <View>
                      <Text style={styles.inputOtherReasonTitle}>
                        {translationString.input_reason_title}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        onChangeText={(text) => otherReasonOnChangeText(text)}
                        value={otherReason}
                        multiline={true}
                        numberOfLines={4}
                      />
                    </View>
                  )}

                {selectedReasonId === scanQRReasonId &&
                  item.id === scanQRReasonId && (
                    <View>
                      <Text style={styles.inputOtherReasonTitle}>
                        {translationString.remark_title}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        value={scanQrResult}
                        onChangeText={(text) =>
                          scannedQRContentOnChangeText(text)
                        }
                        disabled={true}
                        focusable={false}
                        showSoftInputOnFocus={false}
                        multiline={true}
                      />
                    </View>
                  )}
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={() => {
              if (reasonType === Constants.ReasonType.PHOTO_REASON) {
                return (
                  <>
                    <PhotoHorizontalFlatList
                      disabled={true}
                      addPhotoOnPressed={gotoCameraScreen}
                      flatlistBackgroundColor={'#F8F8F8'}
                    />
                    <Text style={styles.inputOtherReasonTitle}>
                      {translationString.select_reason_with_dot}
                    </Text>
                  </>
                );
              } else {
                return null;
              }
            }}
          />

          {alertMsg !== '' && <CustomAlertView alertMsg={alertMsg} />}
        </View>
      </KeyboardAwareScrollView>
      <TouchableHighlight
        underlayColor={Constants.Green_Underlay}
        disabled={selectedReasonId === 0 || isLoading}
        onPress={handleButtonClick}
        style={[
          styles.confirmButton,
          {
            backgroundColor:
              selectedReasonId === 0
                ? Constants.Pending_Color
                : Constants.Completed_Color,
          },
        ]}>
        <View style={styles.button}>
          <Image style={styles.buttonIcon} source={CompleteIcon} />
          <Text style={styles.confirmButtonText}>
            {translationString.confirm}
          </Text>
        </View>
      </TouchableHighlight>
    </>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  flatlist: {
    flex: 1,
  },
  reasonInactiveItemContainer: {
    margin: 10,
    shadowColor: Constants.Pending_Color,
    borderRadius: 4,
    borderColor: '#EFF0F1',
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reasonInactiveText: {
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    color: Constants.Pending_Color,
  },
  reasonActiveItemContainer: {
    margin: 10,
    shadowColor: '#4C494819',
    borderRadius: 4,
    borderColor: '#EFF0F1',
    borderWidth: 1,
    padding: 10,
    backgroundColor: Constants.Completed_Color,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reasonActiveText: {
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    color: 'white',
  },
  confirmButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    fontSize: 24,
    fontFamily: Constants.NoboSansBoldFont,
    color: 'white',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    margin: 6,
  },
  inputOtherReasonTitle: {
    margin: 10,
    fontSize: 15,
    color: '#6E6E6E',
  },
  textInput: {
    marginHorizontal: 10,
    padding: 16,
    height: 125,
    backgroundColor: '#EFEFEF',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowColor: Constants.Pending_Color,
    borderRadius: 4,
    borderColor: '#EFF0F1',
    borderWidth: 1,
    textAlignVertical: 'top',
  },
});
