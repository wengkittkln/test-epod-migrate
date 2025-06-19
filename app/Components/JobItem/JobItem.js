/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Svg, {Path} from 'react-native-svg';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import * as JobHelper from '../../Helper/JobHelper';
import CashIcon from '../../Assets/image/icon_money_small.png';
import DeliverIcon from '../../Assets/image/icon_deliver_small.png';
import DeliverEnglishIcon from '../../Assets/image/icon_deliver_orange.png';
import ContactIcon from '../../Assets/image/icon_contact.png';
import CameraIcon from '../../Assets/image/icon_camera.png';
import WeightIcon from '../../Assets/image/icon_weight.png';
import MoreIcon from '../../Assets/image/icon_more.png';
import PickUpIcon from '../../Assets/image/icon_pickup_small.png';
import PickUpEnglishIcon from '../../Assets/image/icon_collect_grey.png';
import RetakeIcon from '../../Assets/image/icon_resend.png';
import ViewIcon from '../../Assets/image/icon_view.png';
import HideIcon from '../../Assets/image/icon_hide.png';
import {useJobItem} from './useJobItem';
import {useSelector, useDispatch} from 'react-redux';
import moment from 'moment';
import {format} from 'crypto-js';
import * as RootNavigation from '../../rootNavigation';

const JobItem = ({
  item,
  jobId = 0,
  isBatchSelection = false,
  action1 = () => {},
  action2 = () => {},
}) => {
  const languageModel = useSelector((state) => state.LanguageReducer);
  const {
    getDisplayTime,
    statusBarColour,
    getReasonDescription,
    getConsignee,
    getConsigneeTitleWithColon,
    getSyncText,
    getSyncTextColor,
    getSyncIcon,
    getReAttemptName,
    getAction,
    getPeriod,
    getTrackingNumberOrCount,
    gotoDetailScreen,
    moreButtonOnPressed,
    gotoCameraScreen,
    contactButtonOnPressed,
    isModalVisible,
    showHideDialog,
    redoJob,
    getReAttemptMessage,
    trackingNumOnPressed,
    manifestData,
    goToWeightCaptureJobManualEnterScreen,
    isFoodWasteJob,
    isWeightCaptureStep,
    navigateToViewJobBinFailSummary,
    getJobBinQuantity,
    getDecryptData,
    isShowDecrypt,
    decryptedConsignee,
  } = useJobItem(item);

  // Get unread message count from props
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Update hasUnreadMessages when unreadCount changes
  useEffect(() => {
    if (item.unreadCount && item.unreadCount > 0) {
      setHasUnreadMessages(true);
    } else {
      setHasUnreadMessages(false);
    }
  }, [item.unreadCount]);

  const chatButtonOnPressed = () => {
    // When user clicks on chat, mark messages as read
    setHasUnreadMessages(false);

    // If there's a callback to mark messages as read, call it
    if (item.onChatPressed) {
      item.onChatPressed(item.id);
    }

    RootNavigation.navigate('Chat', {
      jobId: item.id,
      job: item,
    });
  };
  const [backgroundColorValue, setBackgroundColorValue] = useState('white');
  const [textColorValue, setTextColorValue] = useState('#A0A0A0');
  const [tackingNumberColorValue, setTrackingNumberColorValue] =
    useState('#000');
  const [tagValue, setTagValue] = useState('');

  const windowWidth = Dimensions.get('screen').width;

  const [showBinInfo, setShowBinInfo] = useState(false);

  useEffect(() => {
    const fetchBinAccess = async () => {
      try {
        const showBinAccess = await isFoodWasteJob();
        setShowBinInfo(showBinAccess);
      } catch (error) {
        console.error('Error fetching bin access:', error);
      }
    };

    fetchBinAccess();
  });

  const renderBatchSelectionJob = () => {
    return (
      <>
        <View style={styles.requestContainer}>
          <View style={styles.requesTimeHorizontalContainer}>
            <Text style={styles.requestTimeLabel}>
              {translationString.request_time_colon}
            </Text>

            <Text style={styles.requestTimeValue}>{getPeriod()}</Text>

            {manifestData.isForcedSequencing && (
              <View>
                <Text style={styles.requestTimeLabel}>ETA:</Text>

                <Text style={styles.etaTimeValue}>
                  {getETA(item.latestETA)}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.actionLabel, {flexWrap: 'wrap', flex: 1}]}>
            {getAction()}
          </Text>
        </View>
      </>
    );
  };

  const renderPendingJob = () => {
    return (
      <>
        <View style={styles.requestContainer}>
          <View style={styles.requesTimeHorizontalContainer}>
            <Text style={styles.requestTimeLabel}>
              {translationString.request_time_colon}
            </Text>

            <Text style={styles.requestTimeValue}>{getPeriod()}</Text>

            {manifestData.isForcedSequencing && (
              <View>
                <Text style={styles.requestTimeLabel}>ETA:</Text>

                <Text style={styles.etaTimeValue}>
                  {getETA(item.latestETA)}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.actionLabel, {flexWrap: 'wrap', flex: 1}]}>
            {getAction()}
          </Text>
        </View>
        <View style={styles.divider} />
      </>
    );
  };

  const renderCompletedJob = () => {
    return (
      <>
        <View style={styles.horizontalContainer}>
          <Text style={styles.signOffTime}>{getDisplayTime()}</Text>
          <View style={styles.completedVerticalLine} />
          <View style={styles.uploadedContainer}>
            <Image style={styles.actionButtonIcon} source={getSyncIcon()} />
            <Text style={[styles.syncText, {color: getSyncTextColor()}]}>
              {getSyncText()}
            </Text>
          </View>
        </View>
        <View style={styles.completedDivider} />
        <Pressable style={styles.cameraContainer} onPress={gotoCameraScreen}>
          <View style={styles.cameraButton}>
            <Image style={styles.cameraIcon} source={CameraIcon} />
            <Text style={styles.cameraButtonText}>
              {translationString.photo}
            </Text>
          </View>
        </Pressable>

        <View style={styles.verticalLine} />
        <Pressable
          onPress={() => getDecryptData()}
          style={[styles.actionButtonOuterContainer, {marginLeft: 5}]}>
          {isShowDecrypt ? (
            <Image
              style={[styles.actionIcon, {height: 20, width: 20}]}
              source={HideIcon}
            />
          ) : (
            <Image
              style={[styles.actionIcon, {height: 20, width: 20}]}
              source={ViewIcon}
            />
          )}
          <Text style={styles.actionButtonText}>
            {translationString.reveal}
          </Text>
        </Pressable>
      </>
    );
  };

  const renderFailedJob = () => {
    return (
      <>
        <View style={styles.horizontalContainer}>
          {showBinInfo ? (
            <TouchableOpacity onPress={() => navigateToViewJobBinFailSummary()}>
              <Text style={styles.failureReason}>
                {translationString.viewFailureDetail}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.failureReason}>{getReasonDescription()}</Text>
          )}

          <View style={styles.completedVerticalLine} />
          <View style={styles.uploadedContainer}>
            <Image style={styles.actionButtonIcon} source={getSyncIcon()} />
            <Text style={[styles.syncText, {color: getSyncTextColor()}]}>
              {getSyncText()}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.horizontalContainer}>
          <Pressable
            style={[styles.retakeButton, {width: windowWidth * 0.275}]}
            onPress={gotoCameraScreen}>
            <Image style={styles.cameraIcon} source={CameraIcon} />
            <Text style={styles.cameraButtonText}>
              {translationString.photo}
            </Text>
          </Pressable>
          <View style={styles.verticalLine} />
          <Pressable
            style={[styles.retakeButton, {width: windowWidth * 0.275}]}
            onPress={() => showHideDialog(true)}>
            <Image style={styles.cameraIcon} source={RetakeIcon} />
            <Text style={styles.cameraButtonText}>{getReAttemptName()}</Text>
          </Pressable>

          <View style={styles.verticalLine} />
          <Pressable
            onPress={() => getDecryptData()}
            style={[styles.retakeButton, {width: windowWidth * 0.275}]}>
            {isShowDecrypt ? (
              <Image
                style={[styles.actionIcon, {height: 20, width: 20}]}
                source={HideIcon}
              />
            ) : (
              <Image
                style={[styles.actionIcon, {height: 20, width: 20}]}
                source={ViewIcon}
              />
            )}
            <Text style={styles.actionButtonText}>
              {translationString.reveal}
            </Text>
          </Pressable>
        </View>
      </>
    );
  };

  const renderAction = () => {
    return (
      <View style={[styles.actionButtonsContainer, {marginBottom: 9}]}>
        <Pressable
          style={[styles.actionButtonOuterContainer, {marginRight: 8}]}
          onPress={contactButtonOnPressed}>
          <Image style={styles.actionIcon} source={ContactIcon} />
          <Text style={styles.actionButtonText}>
            {translationString.contact}
          </Text>
        </Pressable>
        <View style={styles.verticalLine} />
        <Pressable
          style={[styles.actionButtonOuterContainer, {marginLeft: 10}]}
          onPress={gotoCameraScreen}>
          <Image style={styles.actionIcon} source={CameraIcon} />
          <Text style={styles.actionButtonText}>{translationString.photo}</Text>
        </Pressable>
        {isWeightCaptureStep() && (
          <>
            <View style={styles.verticalLine} />
            <Pressable
              delayPressIn={0}
              style={[styles.actionButtonOuterContainer, {paddingLeft: 5}]}
              onPress={goToWeightCaptureJobManualEnterScreen}>
              <Image
                style={styles.actionIcon}
                source={WeightIcon}
                height={21.5}
                width={21.5}
              />
              <Text style={styles.actionButtonText}>
                {translationString.weigh}
              </Text>
            </Pressable>
          </>
        )}
        <View style={styles.verticalLine} />

        <Pressable
          onPress={() => getDecryptData()}
          style={[styles.actionButtonOuterContainer, {marginLeft: 10}]}>
          {isShowDecrypt ? (
            <Image
              style={[styles.actionIcon, {height: 20, width: 20}]}
              source={HideIcon}
            />
          ) : (
            <Image
              style={[styles.actionIcon, {height: 20, width: 20}]}
              source={ViewIcon}
            />
          )}
          <Text style={styles.actionButtonText}>
            {translationString.reveal}
          </Text>
        </Pressable>
        <View style={styles.verticalLine} />

        <Pressable
          delayPressIn={0}
          style={[styles.actionButtonOuterContainer, {paddingLeft: 5}]}
          onPress={chatButtonOnPressed}>
          <View style={styles.svgContainer}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="#504c4c">
              <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </Svg>
            {hasUnreadMessages && <View style={styles.notificationBubble} />}
          </View>
          <Text style={styles.actionButtonText}>{translationString.chat}</Text>
        </Pressable>
        <View style={styles.verticalLine} />
        <Pressable
          delayPressIn={0}
          style={[styles.actionButtonOuterContainer, {paddingLeft: 5}]}
          onPress={moreButtonOnPressed}>
          <Image style={styles.actionIcon} source={MoreIcon} />
          <Text style={styles.actionButtonText}>{translationString.more}</Text>
        </Pressable>
      </View>
    );
  };

  const renderJobByJobStatus = (jobStatus) => {
    if (isBatchSelection) {
      return renderBatchSelectionJob();
    }

    switch (jobStatus) {
      case Constants.JobStatus.IN_PROGRESS:
      case Constants.JobStatus.OPEN:
        return renderPendingJob();

      case Constants.JobStatus.COMPLETED:
        return renderCompletedJob();

      case Constants.JobStatus.FAILED:
      case Constants.JobStatus.PARTIAL_DELIVERY:
        return renderFailedJob();

      default:
        return renderPendingJob();
    }
  };

  const checkIsOverdue = () => {
    let isAfter = false;

    if (item.latestETA && item.requestArrivalTimeTo) {
      isAfter = moment(item.latestETA).isAfter(item.requestArrivalTimeTo);
    }

    return isAfter;
  };

  const getTagColour = () => {
    if (item && item.tags && item.tags.split(',').length > 0) {
      const tagsList = item.tags.split(',');
      if (item && item.customer && item.customer.customerConfigurations) {
        const customerConfigurations = item.customer.customerConfigurations;
        if (customerConfigurations && customerConfigurations.length > 0) {
          tagsList.forEach((tag) => {
            const selectedConfigurationPosition =
              customerConfigurations.findIndex(
                (e) => e.tagName?.toLowerCase() === tag.toLowerCase(),
              );
            if (selectedConfigurationPosition !== -1) {
              const selectedConfiguration =
                item.customer.customerConfigurations[
                  selectedConfigurationPosition
                ];
              if (selectedConfiguration.tagColour) {
                setBackgroundColorValue(
                  selectedConfiguration.tagName === 'VIP'
                    ? checkIsOverdue()
                      ? selectedConfiguration.overdueColor
                        ? selectedConfiguration.overdueColor
                        : Constants.Alert_Color
                      : selectedConfiguration.tagColour
                    : selectedConfiguration.tagColour,
                );
              }
              if (selectedConfiguration.textColor) {
                setTextColorValue(
                  selectedConfiguration.tagName === 'VIP'
                    ? checkIsOverdue()
                      ? '#000'
                      : selectedConfiguration.textColor
                    : selectedConfiguration.textColor,
                );
                setTrackingNumberColorValue(textColorValue);
              }
              setTagValue(selectedConfiguration.tagName?.toUpperCase());
              return;
            }
          });
        }
      }
    }
  };
  useEffect(() => {
    getTagColour();
  }, [item]);

  const getETA = (latestETA) => {
    let eta = '';
    try {
      if (latestETA) {
        eta = moment(latestETA).format('HH:mm');
      } else {
        eta = '-';
      }
    } catch {}

    return eta;
  };

  const renderStatusBar = () => {
    return (
      <View
        style={[
          styles.statusContainer,
          {backgroundColor: statusBarColour(item.status)},
        ]}>
        <Text style={{fontWeight: 'bold', fontSize: 19}}>
          {item.sequence === null || item.sequence <= 0 ? '-' : item.sequence}
        </Text>
      </View>
    );
  };

  const renderReceiverContainer = () => {
    return (
      <View style={styles.receiverContainer}>
        <Text style={styles.receiverLabel}>
          {getConsigneeTitleWithColon()}{' '}
        </Text>
        <Text style={[styles.receiverName, {color: textColorValue}]}>
          {getConsignee()}
        </Text>

        <View style={styles.horizontalContainer}>
          <Text style={{color: textColorValue}}>{tagValue}</Text>
          {item.codAmount > 0 && (
            <Image style={styles.smallIcon} source={CashIcon} />
          )}
          {item.jobType === Constants.JobType.DELIVERY && (
            <Image
              style={styles.smallIcon}
              source={
                languageModel.code !== 'zh-Hants'
                  ? DeliverEnglishIcon
                  : DeliverIcon
              }
            />
          )}
          {item.jobType === Constants.JobType.PICK_UP && (
            <Image
              style={styles.smallIcon}
              source={
                languageModel.code !== 'zh-Hants'
                  ? PickUpEnglishIcon
                  : PickUpIcon
              }
            />
          )}
        </View>
      </View>
    );
  };

  const renderAddressComponent = () => {
    return (
      <View>
        <View style={styles.divider} />
        {showBinInfo ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.receiverName}>
              {translationString.jobId} {item.id}
            </Text>
            <Text style={[{color: '#A0A0A0', fontSize: 10}]}>
              {item.jobType === Constants.JobType.PICK_UP
                ? translationString.collected
                : translationString.delivered}
              /{translationString.expected}
            </Text>
          </View>
        ) : (
          <Text style={styles.receiverName}>
            {translationString.jobId} {item.id}
          </Text>
        )}

        <View style={styles.flexRowContainer}>
          <Text
            style={[styles.address, {fontSize: isBatchSelection ? 14 : 28}]}>
            {item.destination}
          </Text>
          {showBinInfo ? (
            <Text style={styles.quantity}>
              {getJobBinQuantity()}/{item.totalQuantity} {translationString.pcs}
            </Text>
          ) : (
            <Text style={styles.quantity}>
              {item.totalQuantity} {translationString.pcs}
            </Text>
          )}
        </View>
        <View style={styles.divider} />
      </View>
    );
  };

  const renderTrackingNumberOrCount = () => {
    return (
      <Text
        style={[
          styles.doNum,
          {
            textDecorationLine: getTrackingNumberOrCount().isUnderline
              ? 'underline'
              : 'none',
            color: tackingNumberColorValue,
          },
        ]}>
        {getTrackingNumberOrCount().trackingNum}
      </Text>
    );
  };

  const renderBaseComponent = () => {
    return (
      <View>
        <Pressable
          disabled={
            item.status > Constants.JobStatus.IN_PROGRESS ? true : false
          }
          style={[
            styles.baseContainer,
            {backgroundColor: backgroundColorValue},
          ]}
          onPress={gotoDetailScreen}>
          {renderStatusBar()}
          <View style={styles.container}>
            {renderReceiverContainer()}
            <Pressable onPress={trackingNumOnPressed}>
              {renderTrackingNumberOrCount()}
            </Pressable>
            {renderAddressComponent()}
            {renderJobByJobStatus(item.status)}
            {item.status !== Constants.JobStatus.COMPLETED &&
              item.status !== Constants.JobStatus.FAILED &&
              item.status !== Constants.JobStatus.PARTIAL_DELIVERY &&
              renderAction()}
          </View>
        </Pressable>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType={'fade'}>
          <View style={styles.darkBackground}>
            <View style={styles.modelView}>
              <Text style={styles.modelTitle}>{getReAttemptName()}</Text>
              <View style={styles.divider} />

              <Text style={styles.modelText}>{getReAttemptMessage()}</Text>

              <View style={styles.bottomButtonContainer}>
                <Pressable
                  underlayColor={Constants.Light_Grey_Underlay}
                  style={styles.cancelButtonContainer}
                  onPress={() => showHideDialog(false)}>
                  <Text style={styles.cancelModelButton}>
                    {translationString.cancel}
                  </Text>
                </Pressable>

                <Pressable
                  underlayColor={Constants.Green_Underlay}
                  style={styles.redoButtonContainer}
                  onPress={redoJob}>
                  <Text style={styles.redoModelButton}>
                    {getReAttemptName()}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderSelectAbleJobDetail = () => {
    return (
      <View>
        {item.isSelected && (
          <TouchableOpacity
            disabled={jobId === item.id}
            style={styles.selectedContainer}
            onPress={() => {
              action2(item);
            }}>
            <Text style={styles.cancelBtn}>
              {jobId === item.id
                ? translationString.default
                : translationString.cancel_btn}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            item.isSelected = !item.isSelected;
            action1(item);
          }}>
          {renderStatusBar()}
          <View style={styles.container}>
            {renderReceiverContainer()}
            {renderTrackingNumberOrCount()}
            {renderAddressComponent()}
            {renderJobByJobStatus(item.status)}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      {!isBatchSelection && renderBaseComponent()}
      {isBatchSelection && renderSelectAbleJobDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  svgContainer: {
    marginRight: 5,
    marginLeft: 5,
    position: 'relative',
  },
  notificationBubble: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  notificationText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    flexDirection: 'row',
    borderRadius: 2,
    elevation: 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 9,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
  },
  requestContainer: {
    flex: 2,
    flexDirection: 'row',
  },
  receiverContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiverLabel: {
    color: '#A0A0A0',
    fontSize: 18,
  },
  receiverName: {
    flex: 1,
    marginLeft: 4,
    color: '#A0A0A0',
    fontSize: 18,
  },
  smallIcon: {
    marginLeft: 8,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    display: 'flex',
    flex: 3,
  },
  requesTimeHorizontalContainer: {
    flexDirection: 'row',
    flex: 1.7,
    marginVertical: 8,
  },
  doNum: {
    color: '#000',
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    marginVertical: 4,
    marginHorizontal: 8,
    alignSelf: 'flex-end',
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  requestTimeLabel: {
    color: '#A0A0A0',
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    flexWrap: 'wrap',
    flex: 0.4,
  },
  requestTimeValue: {
    color: '#A0A0A0',
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    marginHorizontal: 8,
    flex: 0.6,
    flexWrap: 'wrap',
  },
  etaTimeValue: {
    color: '#A0A0A0',
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    flex: 0.6,
    flexWrap: 'wrap',
  },
  actionLabel: {
    marginVertical: 8,
    paddingRight: 8,
    color: '#278BED',
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    flex: 0.1,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  flexRowContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  address: {
    // borderRightWidth: 1,
    // borderRightColor: Constants.Light_Grey_Underlay,
    flex: 0.85,
    marginTop: 8,
    marginBottom: 16,
    color: Constants.Dark_Grey,
  },
  quantity: {
    marginTop: 8,
    marginBottom: 16,
    paddingLeft: 5,
    flex: 0.15,
    fontSize: 22,
    color: Constants.Dark_Grey,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: (Constants.screenWidth - 59) / 3,
  },
  actionButtonOuterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
    paddingVertical: 16,
    display: 'flex',
  },
  actionIcon: {
    marginRight: 5,
    marginLeft: 5,
  },
  actionButtonIcon: {
    marginVertical: 16,
    marginRight: 8,
  },
  actionButtonText: {
    fontFamily: Constants.NoboSansFont,
    fontSize: Constants.textInputFonSize,
    textAlign: 'center',
    color: '#A0A0A0',
    flex: 1,
    flexWrap: 'wrap',
  },
  verticalLine: {
    width: 1,
    backgroundColor: '#00000029',
  },
  signOffTime: {
    flex: 1.4,
    paddingVertical: 10,
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: '#A0A0A0',
  },
  syncText: {
    paddingVertical: 10,
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
  },
  uploadedContainer: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  completedVerticalLine: {
    width: 1,
    backgroundColor: '#00000029',
    marginTop: 8,
    marginHorizontal: 16,
  },
  completedDivider: {
    marginBottom: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    marginRight: 16,
  },
  cameraButtonText: {
    paddingVertical: 8,
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: '#A0A0A0',
  },
  failureReason: {
    flex: 1.4,
    paddingVertical: 10,
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'red',
  },
  retakeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: (Constants.screenWidth - 59) / 2,
  },
  modelView: {
    width: Constants.screenWidth - 20,
    backgroundColor: Constants.WHITE,
    alignSelf: 'center',
    borderRadius: 8,
  },
  modelTitle: {
    fontSize: 20,
    alignSelf: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    color: Constants.Dark_Grey,
  },
  modelText: {
    fontSize: 24,
    alignSelf: 'center',
    padding: 20,
    color: Constants.Dark_Grey,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
  },
  cancelButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Light_Grey,
    borderBottomLeftRadius: 8,
  },
  redoButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Completed_Color,
    borderBottomRightRadius: 8,
  },
  cancelModelButton: {
    fontSize: 18,
    color: Constants.Dark_Grey,
    alignSelf: 'center',
    padding: 16,
  },
  redoModelButton: {
    fontSize: 18,
    color: Constants.WHITE,
    alignSelf: 'center',
    padding: 16,
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    flexDirection: 'row',
    borderRadius: 2,
    elevation: 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedContainer: {
    position: 'absolute',
    flex: 1,
    borderRadius: 2,
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: '#00000070',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },

  bottomContainer: {
    flexDirection: 'row',
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    flex: 1,
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
  cancelBtn: {
    color: 'white',
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansBoldFont,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 50,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
});

export default JobItem;
