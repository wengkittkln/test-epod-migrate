import React, {useLayoutEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {JobTransferDetailProps} from '../../NavigationStacks/JobTransferStack';
import * as Constants from '../../CommonConfig/Constants';
import {ImageRes} from '../../Assets';
import {TextInput} from 'react-native-gesture-handler';
import {translationString} from '../../Assets/translation/Translation';
import {useJobTransferDetail} from '../../Hooks/JobTransfer/useJobTransferDetail';
import LoadingModal from '../../Components/LoadingModal';
import {CustomDialogView} from '../../Components//General/CustomDialogView';

export const JobTransferDetailScreen = ({
  route,
  navigation,
}: JobTransferDetailProps): JSX.Element => {
  const {
    trackingList,
    parcelQty,
    transferReason,
    status,
    isShowLoadingIndicator,
    jobQty,
    fromUser,
    username,
    driver,
    isShowDialog,
    rejectReason,
    id,
    isShowQtyDialog,
    receivedQty,
    confirmTransfer,
    confirmReceive,
    goBack,
    cancelRequest,
    setIsShowDialog,
    setRejectReason,
    setIsShowLoadingIndicator,
    getStatusColor,
    getStatusText,
    setIsShowQtyDialog,
    setReceivedQty,
  } = useJobTransferDetail(navigation);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            goBack();
          }}>
          <Image source={ImageRes.BackButton} />
        </TouchableOpacity>
      ),
      headerTitle: translationString.job_transfers.request_details,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.baseContainer}>
      <View style={[styles.container]}>
        <ScrollView>
          <View
            style={[
              styles.childContainer,
              {flex: 1, marginBottom: 20, justifyContent: 'space-evenly'},
            ]}>
            {status !== -1 && (
              <View
                style={[
                  styles.statusContainer,
                  {
                    height: 23,
                    padding: 0,
                    flex: 1.8,
                    flexDirection: 'column',
                    backgroundColor: getStatusColor(status),
                  },
                ]}>
                <Text
                  style={{
                    paddingTop: 2,
                    fontSize: 12,
                    color: 'white',
                    marginBottom: 5,
                  }}>
                  {getStatusText(status)}
                </Text>
              </View>
            )}
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>
                {translationString.job_transfers.request_transfer_job}
              </Text>
              <Text style={[styles.text, styles.value]}>{jobQty}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>
                {translationString.job_transfers.parcel_quantity}
              </Text>
              <Text style={[styles.text, styles.value]}>
                {parcelQty.toString()}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>
                {translationString.job_transfers.transfer_reason}
              </Text>
              <Text style={[styles.text, styles.value]}>{transferReason}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>
                {translationString.job_transfers.transferTo}
              </Text>
              <Text style={[styles.text, styles.value]}>{driver}</Text>
            </View>
            {status === 2 && (
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.text}>
                  {translationString.job_transfers.rejectedReason}
                </Text>
                <Text style={[styles.text, styles.value]}>{rejectReason}</Text>
              </View>
            )}
          </View>
          <View style={[styles.childContainer, {flex: 2}]}>
            <View>
              <Text style={[styles.text, {color: 'black', fontWeight: 'bold'}]}>
                {translationString.job_transfers.accept_job_list}
              </Text>
              {trackingList.map((item, index) => (
                <Text
                  key={index}
                  style={[styles.text, {color: Constants.THEME_COLOR}]}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      {status === -1 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: Constants.Failed_Color},
            ]}
            onPress={() => {
              navigation.popToTop();
            }}>
            <Text style={styles.confirmText}>{translationString.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: Constants.Completed_Color},
            ]}
            onPress={() => confirmTransfer()}>
            <Text style={styles.confirmText}>
              {translationString.job_transfers.confirm_transfer}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {status === 0 && fromUser == username && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: Constants.Failed_Color},
            ]}
            onPress={() => {
              setIsShowLoadingIndicator(true);
              cancelRequest();
            }}>
            <Text style={styles.confirmText}>
              {translationString.job_transfers.cancelRequest}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {(status === 1 || status === 2 || status === 3) && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: Constants.THEME_COLOR},
            ]}
            onPress={() => {
              navigation.popToTop();
            }}>
            <Text style={styles.confirmText}>
              {translationString.job_transfers.back_to_request_list}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {status === 0 && fromUser != username && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: Constants.Failed_Color},
            ]}
            onPress={() => {
              setIsShowDialog(true);
            }}>
            <Text style={styles.confirmText}>
              {translationString.job_transfers.reject}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: Constants.THEME_COLOR},
            ]}
            onPress={() => {
              setIsShowQtyDialog(true);
            }}>
            <Text style={styles.confirmText}>
              {translationString.job_transfers.accept_transfer}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <LoadingModal
        isShowLoginModal={isShowLoadingIndicator}
        message={translationString.searching}
      />
      {/* TODO translate */}
      <CustomDialogView
        isError={false}
        description={translationString.job_transfers.pleaseEnterReason}
        isShow={isShowDialog}
        onLeftClick={() => {
          setIsShowDialog(false);
        }}
        onRightClick={() => {
          setIsShowLoadingIndicator(true);
          confirmReceive(false);
        }}>
        <TextInput
          style={styles.textInput}
          onChangeText={setRejectReason}
          value={rejectReason}></TextInput>
      </CustomDialogView>
      <CustomDialogView
        isError={false}
        description={translationString.job_transfers.enter_parcel_quantity_error}
        isShow={isShowQtyDialog}
        onLeftClick={() => {
          setIsShowQtyDialog(false);
        }}
        onRightClick={() => {
          setIsShowLoadingIndicator(true);
          confirmReceive(true);
        }}>
        <TextInput
          style={styles.textInput}
          onChangeText={setReceivedQty}
          value={receivedQty}
          keyboardType="numeric"></TextInput>
      </CustomDialogView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#ecedee',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    paddingBottom: 0,
    justifyContent: 'flex-start',
  },
  childContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
  },
  input: {
    color: Constants.THEME_COLOR,
    fontWeight: '700',
    fontSize: 18,
    backgroundColor: '#fff',
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
  value: {
    color: Constants.THEME_COLOR,
    fontWeight: 'bold',
    marginLeft: 10,
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
  qr: {
    paddingBottom: 10,
    paddingTop: 0,
    alignItems: 'center',
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

  statusContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
