import React, {useLayoutEffect, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  ScrollView,
  ImageBackground,
  FlatList,
  Pressable,
  Platform,
  Linking,
} from 'react-native';
import * as Constants from '../../../CommonConfig/Constants';
import * as JobHelper from '../../../Helper/JobHelper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translationString} from '../../../Assets/translation/Translation';
import PhoneIcon from '../../../Assets/image/icon_phone.png';
import CameraIcon from '../../../Assets/image/icon_camera.png';
import NextIcon from '../../../Assets/image/icon_continue_small.png';
import BackgroundImg from '../../../Assets/image/img_bg_colour.png';
import GreyBackgroundImg from '../../../Assets/image/img_bg_colour_grey.png';
import LorryIcon from '../../../Assets/image/img_bg_lorry.png';
import PeopleIcon from '../../../Assets/image/icon_people.png';
import LocationIcon from '../../../Assets/image/icon_location.png';
import StatusLineIcon from '../../../Assets/image/icon_status_line.png';
import {useJobDetail} from '../../../Hooks/JobList/JobDetail/useJobDetail';
import OrderDetailComponent from '../../../Components/OrderDetail/OrderDetailComponent';
import ContainerDetailComponent from '../../../Components/OrderDetail/ContainerDetailComponent';
import RetakeIcon from '../../../Assets/image/icon_resend.png';
import Modal from 'react-native-modal';
import LoadingIndicator from '../../../Components/Loading/LoadingComponent';
import {color} from 'react-native-reanimated';
import {ToastMessageErrorMultiLine} from '../../../Components/Toast/ToastMessage';
import {CustomDialogView} from '../../../Components/General/CustomDialogView';
import ScannedItemDetailComponent from '../../FoodWaste/Job/ScannedItemDetailComponent';
import WeightIcon from '../../../Assets/image/icon_weight.png';
import * as JobBinRealmManager from '../../../Database/realmManager/JobBinRealmManager';
import * as OrderItemRealmManager from '../../../Database/realmManager/OrderItemRealmManager';
import * as OrderRealmManager from '../../../Database/realmManager/OrderRealmManager';
import {IndexContext} from '../../../Context/IndexContext';
import {ToastMessageMultiLine} from '../../../Components/Toast/ToastMessage';
import ViewIcon from '../../../Assets/image/icon_view_white.png';
import HideIcon from '../../../Assets/image/icon_hide_white.png';

export default ({route, navigation}) => {
  const {
    job,
    consigneeName,
    trackNumModel,
    requestTime,
    orderList,
    isModalVisible,
    totalPhoto,
    totalSyncedPhoto,
    containerList,
    getReAttemptName,
    getStatusText,
    nextButtonOnPressed,
    cameraButtonOnPressed,
    contactButtonOnPressed,
    redoJob,
    getReAttemptMessage,
    showHideDialog,
    exportPhoto,
    getTotalQuantity,
    weightButtonOnPressed,
    isShowDecrypt,
    decryptedConsignee,
    decryptedContact,
    getDecryptData,
  } = useJobDetail(route, navigation);

  const step = route.params.step;
  const {epodRealm} = React.useContext(IndexContext);

  const [backgroundColorValue, setBackgroundColorValue] = useState('#ffffff');
  const [textColorValue, setTextColorValue] = useState('#A0A0A0');
  const [tagValue, setTagValue] = useState('');

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [isShowConfirmation, setIsShowConfirmation] = useState(false);
  const [isShowDeleteBinConfirmation, setIsShowDeleteBinConfirmation] =
    useState(false);
  const [scannedItemsData, setScannedItemsData] = useState([]);
  const [deleteBinId, setDeleteBinId] = useState(0);

  const getTagColour = () => {
    if (job.tags && job.tags.split(',').length > 0) {
      const tagsList = job.tags.split(',');
      if (job.customer && job.customer.customerConfigurations) {
        const customerConfigurations = job.customer.customerConfigurations;
        if (customerConfigurations && customerConfigurations.length > 0) {
          tagsList.forEach((tag) => {
            const selectedConfigurationPosition =
              customerConfigurations.findIndex(
                (e) => e.tagName?.toLowerCase() === tag.toLowerCase(),
              );
            if (selectedConfigurationPosition !== -1) {
              const selectedConfiguration =
                job.customer.customerConfigurations[
                  selectedConfigurationPosition
                ];
              if (selectedConfiguration.tagColour) {
                setBackgroundColorValue(selectedConfiguration.tagColour);
              }
              if (selectedConfiguration.textColor) {
                setTextColorValue(selectedConfiguration.textColor);
              }
              setTagValue(selectedConfiguration.tagName?.toUpperCase());
              return;
            }
          });
        }
      }
    }
  };

  const getScannedItemList = () => {
    const itemList = JobBinRealmManager.getJobBinByJob(epodRealm, job.id).map(
      (data) => ({
        id: data.id,
        sku: data.bin,
        weight: data.netWeight,
        isReject: data.isReject,
      }),
    );
    setScannedItemsData([...itemList]);
  };

  const removeScannedItemData = async (binId) => {
    const currentJobOrderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );
    const order = currentJobOrderList[0];
    const orderItemList = await OrderItemRealmManager.getOrderItemsByOrderId(
      order.id,
      epodRealm,
    );

    const orderItem = orderItemList[0];

    JobBinRealmManager.deleteJobBinById(epodRealm, binId);
    ToastMessageMultiLine({
      text1: translationString.binDeleteSuccess,
      text1NumberOfLines: 3,
    });

    const newJobBinList = JobBinRealmManager.getJobBinByJob(epodRealm, job.id);
    await OrderItemRealmManager.updateOrderItemQuantity(
      orderItem,
      newJobBinList.length,
      epodRealm,
    );

    getScannedItemList();
    setIsShowDeleteBinConfirmation(false);
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

  const isWeightCaptureStep = () => {
    if (!job.customer) {
      return false;
    }

    const stepcode = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    if (stepcode) {
      return [Constants.StepCode.WEIGHT_CAPTURE].includes(stepcode.stepCode);
    } else {
      return false;
    }
  };

  useEffect(() => {
    getTagColour();
  });

  useEffect(() => {
    getScannedItemList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView
      style={styles.baseContainer}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}>
      <ScrollView bounces={false} nestedScrollEnabled={true}>
        <View
          style={[
            styles.verticalContainer,
            {
              width,
            },
          ]}>
          <ImageBackground
            style={[styles.backgroundImg, {width, height: height * 0.28}]}
            source={
              job.jobType === Constants.JobType.PICK_UP
                ? GreyBackgroundImg
                : BackgroundImg
            }>
            <Image
              style={[
                styles.headerRightContainerIcon,
                {
                  width,
                  minHeight: height * 0.28,
                },
              ]}
              source={LorryIcon}
            />
            <View
              style={[
                styles.horizontalContainer,
                {
                  marginTop: 10,
                  width: '90%',
                  marginLeft: '5%',
                },
              ]}>
              <Image source={PeopleIcon} />
              <Text style={styles.receivername}>
                {isShowDecrypt ? decryptedConsignee : consigneeName}
              </Text>
              {tagValue ? (
                <Text
                  style={{
                    overflow: 'hidden',
                    color: textColorValue,
                    backgroundColor: `${backgroundColorValue}`,
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    height: 20,
                    marginLeft: 10,
                  }}>
                  {tagValue}
                </Text>
              ) : (
                <></>
              )}
              <View style={{flex: 1}} />
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
                  {isShowDecrypt ? (
                    <Image
                      style={[{height: 20, width: 20}]}
                      source={HideIcon}
                      underlayColor="white"
                    />
                  ) : (
                    <Image
                      style={[{height: 20, width: 20}]}
                      source={ViewIcon}
                      underlayColor="white"
                    />
                  )}
                  <Text style={{color: 'white'}}>
                    {translationString.reveal}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View
              style={[
                styles.horizontalContainer,
                {
                  marginTop: 10,
                  width: '90%',
                  marginLeft: '5%',
                },
              ]}>
              <View
                style={[
                  styles.verticalContainer,
                  {
                    width: '50%',
                  },
                ]}>
                <View
                  style={[
                    styles.horizontalContainer,
                    {
                      marginTop: 10,
                      width: '100%',
                    },
                  ]}>
                  <Image source={PhoneIcon} />
                  <Text style={styles.name}>
                    {isShowDecrypt
                      ? decryptedContact ?? '-'
                      : job.contact ?? '-'}
                  </Text>
                  <View style={{flex: 1}} />
                </View>

                <TouchableOpacity
                  onPress={() => setIsShowConfirmation(true)}
                  style={[
                    styles.horizontalContainer,
                    {
                      marginTop: 10,
                      width: '100%',
                    },
                  ]}>
                  <Image style={styles.smallIcon} source={LocationIcon} />
                  <View style={{width: '90%'}}>
                    <Text
                      style={styles.name}
                      numberOfLines={3}
                      ellipsizeMode={'tail'}>
                      {job.destination}
                    </Text>
                  </View>
                  <View style={{flex: 1}} />
                </TouchableOpacity>
                <CustomDialogView
                  onLeftClick={() => setIsShowConfirmation(false)}
                  onRightClick={() => openAddressInMap(job.destination)}
                  description={translationString.redirectMapDialogDescription}
                  title={translationString.redirectMapDialogTitle}
                  isShow={isShowConfirmation}
                />
              </View>

              <View
                style={[
                  styles.verticalContainer,
                  {
                    width: '50%',
                  },
                ]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
                <Image source={StatusLineIcon} />
              </View>
            </View>
          </ImageBackground>

          <View>
            <View
              style={[
                styles.jobDetailContainer,
                {backgroundColor: backgroundColorValue},
              ]}>
              <View
                style={[
                  styles.greyView,
                  {
                    backgroundColor: JobHelper.statusBarColour(job.status),
                  },
                ]}
              />
              <View style={{width: '95%'}}>
                <Text
                  style={[
                    styles.jobDetailTitle,
                    {marginLeft: '2.5%', marginTop: 5},
                  ]}>
                  {translationString.job_detail_title}
                </Text>
                <View style={styles.jodDetailInfo}>
                  <View style={styles.horizontalContainer}>
                    <Text style={styles.label}>
                      {translationString.tracking_no}
                    </Text>
                    <Text
                      style={[
                        styles.blueText,
                        {
                          textDecorationLine: trackNumModel.isUnderline
                            ? 'underline'
                            : 'none',
                        },
                      ]}>
                      {trackNumModel.trackingNum}
                    </Text>
                    <View style={{flex: 1}} />
                  </View>
                  <View style={styles.horizontalContainer}>
                    <Text style={styles.label}>{translationString.order}</Text>
                    <Text style={styles.value}>{job.orderList}</Text>
                    <View style={{flex: 1}} />
                  </View>
                  <View style={styles.horizontalContainer}>
                    <Text style={styles.label}>
                      {translationString.request_time}
                    </Text>
                    <Text style={styles.value}>{requestTime}</Text>
                    <View style={{flex: 1}} />
                  </View>
                  {job.codAmount > 0 && (
                    <View style={styles.horizontalContainer}>
                      <Text style={styles.label}>{translationString.cod}</Text>
                      <Text style={styles.value}>
                        {job.codCurrency} {job.codAmount.toFixed(2)}
                      </Text>
                      <View style={{flex: 1}} />
                    </View>
                  )}
                  <View style={styles.horizontalContainer}>
                    <Text style={styles.label}>{translationString.remark}</Text>
                    <Text style={styles.value}>{job.remark}</Text>
                    <View style={{flex: 1}} />
                  </View>
                  <View style={styles.horizontalContainer}>
                    <Text style={styles.label}>
                      {translationString.picture}
                    </Text>
                    <Text
                      style={[
                        styles.value,
                        {color: '#323940', textAlign: 'center', fontSize: 13},
                      ]}>
                      {translationString.total_photo}:
                    </Text>
                    <Text style={styles.value}>{totalPhoto}</Text>
                    <Text
                      style={[
                        styles.value,
                        {color: '#323940', textAlign: 'center', fontSize: 13},
                      ]}>
                      {'  '}
                      {translationString.uploaded}:
                    </Text>
                    <Text style={styles.value}>{totalSyncedPhoto}</Text>
                    {totalPhoto ? (
                      <TouchableOpacity
                        onPress={exportPhoto}
                        style={styles.previewButton}>
                        <Text
                          style={[
                            styles.value,
                            {color: 'white', textAlign: 'center', fontSize: 15},
                          ]}>
                          {translationString.preview}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <></>
                    )}
                    <View style={{flex: 1}} />
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.verticalContainer,
              {
                width: '100%',
              },
            ]}>
            <View
              style={[
                styles.horizontalContainer,
                {
                  marginTop: 10,
                  width: '95%',
                },
              ]}>
              <Text style={styles.jobDetailTitle}>
                {translationString.order_detail_title}
              </Text>
              <View style={{flex: 1}} />
            </View>
            <FlatList
              data={orderList}
              renderItem={({item, index}) => (
                <OrderDetailComponent
                  key={index}
                  orderModel={item}
                  job={job}
                  trackNumModel={trackNumModel}
                  requestTime={requestTime}
                  isShowDecrypt={isShowDecrypt}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              style={{width: '95%'}}
            />
            <FlatList
              data={containerList && containerList.length > 0 ? [1] : []}
              renderItem={({item, index}) => (
                <ContainerDetailComponent
                  containerList={containerList}
                  job={job}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              style={{width: '95%'}}
            />
          </View>

          <View
            style={[
              styles.verticalContainer,
              {
                width: '100%',
              },
            ]}>
            <View
              style={[
                styles.horizontalContainer,
                {
                  marginTop: 10,
                  width: '95%',
                },
              ]}>
              <Text style={styles.jobDetailTitle}>
                {translationString.scannedItem}
              </Text>

              <View style={{flex: 1}} />
            </View>
            <View style={{width: '95%'}}>
              <ScannedItemDetailComponent
                scannedItemsData={scannedItemsData}
                expectedQty={job.totalQuantity}
                removeScannedItemData={(id) => {
                  setDeleteBinId(id);
                  setIsShowDeleteBinConfirmation(true);
                }}
                jobType={job.jobType}
                status={job.status}
              />
            </View>
            <CustomDialogView
              onLeftClick={() => setIsShowDeleteBinConfirmation(false)}
              onRightClick={() => removeScannedItemData(deleteBinId)}
              description={translationString.deleteBinWarningMessage}
              title={translationString.warning}
              isShow={isShowDeleteBinConfirmation}
            />
          </View>

          <View style={styles.actionsContainer}>
            {step &&
              job.status !== Constants.JobStatus.FAILED &&
              job.status !== Constants.JobStatus.PARTIAL_DELIVERY && (
                <TouchableOpacity
                  style={styles.actionGreyButton}
                  onPress={contactButtonOnPressed}>
                  <Image source={PhoneIcon} style={styles.actionIcon} />
                  <Text style={styles.darkButtonText}>
                    {translationString.contact}
                  </Text>
                </TouchableOpacity>
              )}

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionGreyButton}
              onPress={cameraButtonOnPressed}>
              <Image source={CameraIcon} style={styles.actionIcon} />
              <Text style={styles.darkButtonText}>
                {translationString.photo}
              </Text>
            </TouchableOpacity>

            {isWeightCaptureStep() && (
              <>
                <View style={styles.actionDivider} />
                <TouchableOpacity
                  style={styles.actionGreyButton}
                  onPress={weightButtonOnPressed}>
                  <Image
                    source={WeightIcon}
                    style={[styles.actionIcon, {height: 20, width: 20}]}
                  />
                  <Text style={styles.darkButtonText}>
                    {translationString.weigh}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {job &&
              (job.status === Constants.JobStatus.FAILED ||
                job.status === Constants.JobStatus.PARTIAL_DELIVERY) && (
                <View style={{flexDirection: 'row', flex: 1}}>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.actionGreyButton}
                    onPress={() => showHideDialog(true)}>
                    <Image source={RetakeIcon} style={styles.actionIcon} />
                    <Text style={styles.darkButtonText}>
                      {getReAttemptName()}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {step &&
              job.status !== Constants.JobStatus.FAILED &&
              job.status !== Constants.JobStatus.PARTIAL_DELIVERY && (
                <TouchableOpacity
                  style={styles.actionGreenButton}
                  onPress={nextButtonOnPressed}>
                  <Image source={NextIcon} style={styles.nextIcon} />
                  <Text style={styles.whiteButtonText}>
                    {translationString.next_btn}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </ScrollView>
      <View>
        <Modal isVisible={isModalVisible}>
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
                <Text style={styles.redoModelButton}>{getReAttemptName()}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: 'white',
  },
  backgroundImg: {
    width: '100%',
  },
  headerLeftContainer: {
    width: wp('50%'),
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  headerRightContainer: {
    width: wp('50%'),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerRightContainerIcon: {
    position: 'absolute',
    width: Constants.screenWidth,
  },
  horizontalContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: Constants.buttonFontSize,
    color: 'white',
    fontFamily: Constants.NoboSansFont,
    marginLeft: 10,
    textDecorationLine: 'underline',
  },
  receivername: {
    fontSize: Constants.buttonFontSize,
    color: 'white',
    fontFamily: Constants.NoboSansFont,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 20,
    color: 'white',
    fontFamily: Constants.NoboSansFont,
    maxWidth: 180,
    paddingHorizontal: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 8,
  },
  jobDetailContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    borderRadius: 2,
    marginBottom: 10,
  },
  greyView: {
    width: 11,
    backgroundColor: Constants.Pending_Color,
  },
  jodDetailInfo: {
    width: '90%',
    marginLeft: '2.5%',
    marginTop: 5,
  },
  jobDetailTitle: {
    fontFamily: Constants.NoboSansBoldFont,
    fontSize: 20,
    color: 'black',
  },
  label: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: Constants.Pending_Color,
    width: '30%',
  },
  orderLabel: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: Constants.Pending_Color,
    flex: 1,
  },
  productLabel: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: 'black',
    flex: 1,
    textDecorationLine: 'underline',
  },
  orderItem: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'black',
    flex: 1,
  },
  actualQunatity: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginVertical: 16,
    color: 'black',
    flex: 1,
  },
  value: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'black',
    marginBottom: 8,
  },
  blueText: {
    color: '#29B6F6',
    marginBottom: 8,
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
  },
  orderDetailContainer: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'lightgrey',
    marginTop: 10,
    padding: 10,
    paddingHorizontal: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgb(224, 224, 224)',
    marginTop: 8,
  },
  actionGreyButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(224, 224, 224)',
    flexDirection: 'row',
  },
  actionGreenButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(65, 195, 0)',
    flexDirection: 'row',
  },
  darkButtonText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: Constants.Dark_Grey,
    paddingVertical: 24,
  },
  whiteButtonText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: 'white',
    paddingVertical: 24,
  },
  actionDivider: {
    marginVertical: 8,
    width: 1,
    backgroundColor: Constants.Pending_Color,
  },
  actionIcon: {
    marginRight: 5,
    tintColor: Constants.Dark_Grey,
  },
  nextIcon: {
    marginRight: 8,
  },
  modelView: {
    minWidth: 320,
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
  smallIcon: {
    width: '10%',
  },
  previewButton: {
    minWidth: 60,
    borderRadius: 4,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 7,
    backgroundColor: Constants.THEME_COLOR,
    marginBottom: 10,
    marginLeft: 20,
  },
});
