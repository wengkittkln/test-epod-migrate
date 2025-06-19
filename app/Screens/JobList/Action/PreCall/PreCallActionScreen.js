/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  ScrollView,
  Pressable,
  Platform,
  Linking,
} from 'react-native';
import * as Constants from '../../../../CommonConfig/Constants';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Svg, {Ellipse} from 'react-native-svg';
import {translationString} from '../../../../Assets/translation/Translation';
import PhoneIcon from '../../../../Assets/image/icon_call_big.png';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import FailedIcon from '../../../../Assets/image/icon_failed.png';
import CompleteIcon from '../../../../Assets/image/icon_success.png';
import EditIcon from '../../../../Assets/image/icon_editcontact.png';
import {usePreCallAction} from '../../../../Hooks/JobList/Action/PreCall/usePreCallAction';
import EditContactNumberModal from '../../../../Components/EditContactNumberModal/EditContactNumberModal';
import LoadingModal from '../../../../Components/LoadingModal';
import {ToastMessageErrorMultiLine} from '../../../../Components/Toast/ToastMessage';
import {CustomDialogView} from '../../../../Components/General/CustomDialogView';
import ViewIcon from '../../../../Assets/image/icon_view.png';
import HideIcon from '../../../../Assets/image/icon_hide.png';

export default ({route, navigation}) => {
  const {
    job,
    consigneeName,
    stepCode,
    startTime,
    endTime,
    locationModel,
    isShowEditModal,
    phoneNum,
    photoTaking,
    actionModel,
    isAllowBatchAction,
    batchJob,
    callButtonOnPressed,
    completeButtonOnPressed,
    failedButtonOnPressed,
    editButtonOnPressed,
    cancelEditContactNumberModal,
    confirmEditContactNumberModal,
    getBatchSelectedJobCount,
    previewBatchSelectedJob,
    skipPreCall,
    isShowDecrypt,
    decryptedConsignee,
    decryptedContact,
    getDecryptData,
    modalContactNumber,
    setModalContactNumber,
  } = usePreCallAction(route, navigation);

  const [isLoading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [isShowConfirmation, setIsShowConfirmation] = useState(false);

  const handleButtonClick = async () => {
    setLoading(true);
    if (startTime.length > 0 && endTime.length > 0) {
      await completeButtonOnPressed();
    } else {
      callButtonOnPressed();
    }
    setLoading(false);
  };

  const openAddressInMap = (address) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });

    Linking.openURL(url)
      .then((_) => {
        setIsShowConfirmation(false);
      })
      .catch((_) =>
        ToastMessageErrorMultiLine({
          text1: translationString.unableToOpenMap,
          text1NumberOfLines: 2,
        }),
      );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor:
          job.jobType === Constants.JobType.PICK_UP
            ? Constants.Pending_Color
            : Constants.THEME_COLOR,
        shadowColor: 'transparent',
        shadowRadius: 0,
        shadowOffset: {
          height: 0,
        },
        elevation: 0,
      },
      headerLeft: () => (
        <Pressable
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={BackButton} />
        </Pressable>
      ),
      headerRight: () => {
        if (
          startTime.length === 0 &&
          endTime.length === 0 &&
          (stepCode === Constants.StepCode.PRE_CALL ||
            stepCode === Constants.StepCode.PRE_CALL_COLLECT)
        ) {
          return (
            <Pressable
              style={Constants.navStyles.navButton}
              onPress={() => {
                skipPreCall();
              }}>
              <Text style={styles.skipButtonText}>
                {translationString.skip}
              </Text>
            </Pressable>
          );
        } else {
          return null;
        }
      },

      headerTitle: translationString.precall,
    });
  }, [
    job,
    job.jobType,
    navigation,
    startTime,
    endTime,
    locationModel,
    batchJob,
  ]);

  return (
    <View
      style={styles.baseContainer}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}>
      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading2}
      />
      <ScrollView bounces={false} style={styles.baseContainer}>
        <View>
          <View
            style={[
              styles.rectangleContainer,
              {
                width,
                height: height * 0.18,
                backgroundColor:
                  job.jobType === Constants.JobType.PICK_UP
                    ? Constants.Pending_Color
                    : Constants.THEME_COLOR,
              },
            ]}>
            <Text style={styles.name}>
              {isShowDecrypt ? decryptedConsignee : consigneeName}
            </Text>
          </View>
          <Svg
            style={{marginTop: -(height * 0.1)}}
            height={height * 0.22}
            width={width}>
            <Ellipse
              cx={width * 0.5}
              cy="0"
              rx={width * 0.7}
              ry={height * 0.16}
              fill={
                job.jobType === Constants.JobType.PICK_UP
                  ? Constants.Pending_Color
                  : Constants.THEME_COLOR
              }
            />
          </Svg>
          <View style={styles.content}>
            <Pressable
              onPress={() => getDecryptData()}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text>{translationString.reveal}</Text>

                {isShowDecrypt ? (
                  <Image style={[{height: 20, width: 20}]} source={HideIcon} />
                ) : (
                  <Image style={[{height: 20, width: 20}]} source={ViewIcon} />
                )}
              </View>
            </Pressable>

            <Text style={styles.label}>{translationString.phone_number}</Text>
            <View style={styles.horizontalContainer}>
              <Text style={styles.value}>
                {isShowDecrypt ? decryptedContact : phoneNum}
              </Text>
              {startTime.length === 0 && endTime.length === 0 && (
                <TouchableOpacity
                  style={styles.editIcon}
                  onPress={editButtonOnPressed}>
                  <Image source={EditIcon} resizeMode={'stretch'} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>{translationString.address}</Text>

            <TouchableOpacity onPress={() => setIsShowConfirmation(true)}>
              <Text style={[styles.value, {textDecorationLine: 'underline'}]}>
                {job.destination}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>{translationString.remark}</Text>
            <Text style={styles.value}>{job.remark}</Text>
            <CustomDialogView
              onLeftClick={() => setIsShowConfirmation(false)}
              onRightClick={() => openAddressInMap(job.decryptedDestination)}
              description={translationString.redirectMapDialogDescription}
              title={translationString.redirectMapDialogTitle}
              isShow={isShowConfirmation}
            />
          </View>
        </View>
      </ScrollView>
      {startTime.length > 0 && endTime.length > 0 ? (
        <View>
          {isAllowBatchAction && (
            <TouchableOpacity
              style={styles.batchActionButton}
              onPress={previewBatchSelectedJob}
              disabled={isLoading}>
              <Text style={styles.batchActionButtonText}>
                {translationString.batchPreCall} -
                {translationString.formatString(
                  translationString.selected_title,
                  getBatchSelectedJobCount(),
                )}
              </Text>
            </TouchableOpacity>
          )}
          <View
            style={[
              styles.bottomButtonContainer,
              {width, height: height * 0.2},
            ]}>
            <TouchableHighlight
              underlayColor={Constants.Light_Grey_Underlay}
              style={[
                styles.failButton,
                {
                  width: width * 0.5,
                },
              ]}
              onPress={failedButtonOnPressed}>
              <View style={[styles.button]}>
                <Image style={styles.buttonIcon} source={FailedIcon} />
                <Text style={styles.failButtonText}>
                  {translationString.failed}
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={Constants.Green_Underlay}
              style={[
                styles.completeButton,
                {
                  width: width * 0.5,
                },
              ]}
              onPress={handleButtonClick}
              disabled={isLoading}>
              <View style={[styles.button]}>
                <Image style={styles.buttonIcon} source={CompleteIcon} />
                <Text style={styles.completeButtonText}>
                  {translationString.completed}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleButtonClick}
            disabled={isLoading}>
            <Image style={styles.phoneIcon} source={PhoneIcon} />
            <Text style={styles.callButtonText}>{translationString.call}</Text>
          </TouchableOpacity>
          {isAllowBatchAction && (
            <TouchableOpacity
              style={styles.batchActionButton}
              onPress={previewBatchSelectedJob}
              disabled={isLoading}>
              <Text style={styles.batchActionButtonText}>
                {translationString.batchPreCall} -
                {translationString.formatString(
                  translationString.selected_title,
                  getBatchSelectedJobCount(),
                )}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <EditContactNumberModal
        contactNumber={modalContactNumber}
        isShowModal={isShowEditModal}
        cancelButtonOnPress={cancelEditContactNumberModal}
        confirmButtonOnPress={confirmEditContactNumberModal}
        textOnChange={setModalContactNumber}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  rectangleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  name: {
    fontSize: 30,
    color: 'white',
    fontFamily: Constants.NoboSansBoldFont,
    marginHorizontal: 30,
  },
  label: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
    marginHorizontal: 30,
    marginTop: 40,
    marginBottom: 6,
    color: Constants.Pending_Color,
  },
  value: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
    marginHorizontal: 30,
    color: Constants.Dark_Grey,
    fontWeight: 'bold',
    flex: 1,
  },
  callButton: {
    borderRadius: 200,
    backgroundColor: Constants.Completed_Color,
    marginHorizontal: 50,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  callButtonText: {
    color: 'white',
    fontSize: 20,
    paddingVertical: 16,
    fontFamily: Constants.NoboSansBoldFont,
  },
  batchActionButton: {
    borderRadius: 200,
    backgroundColor: 'white',
    borderColor: Constants.Completed_Color,
    borderWidth: 1,
    marginHorizontal: 50,
    marginBottom: 20,
    color: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  batchActionButtonText: {
    color: 'black',
    fontSize: 12,
    paddingVertical: 16,
    fontFamily: Constants.NoboSansBoldFont,
  },
  phoneIcon: {
    marginRight: 16,
  },
  skipButtonText: {
    fontSize: 18,
    color: 'white',
    fontFamily: Constants.NoboSansBoldFont,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failButton: {
    width: Constants.screenWidth / 2,
    backgroundColor: Constants.Light_Grey,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  failButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.Dark_Grey,
  },
  completeButton: {
    width: Constants.screenWidth / 2,
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansBoldFont,
    color: 'white',
  },
  buttonIcon: {
    margin: 6,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {padding: 10},
});
