/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import * as Constants from '../../../../CommonConfig/Constants';
import {translationString} from '../../../../Assets/translation/Translation';
import FailedIcon from '../../../../Assets/image/icon_failed.png';
import CompleteIcon from '../../../../Assets/image/icon_success.png';
import {usePocAction} from '../../../../Hooks/JobList/Action/POC/usePocAction';
import LoadingModal from '../../../../Components/LoadingModal';
import {ToastMessageErrorMultiLine} from '../../../../Components/Toast/ToastMessage';
import {MapIcon} from '../../../../Assets/ImageRes';
import {CustomDialogView} from '../../../../Components/General/CustomDialogView';

export default ({route, navigation}) => {
  const {
    job,
    consigneeName,
    trackNumModel,
    isAllowBatchAction,
    isFoodWasteJob,
    completeButtonOnPressed,
    failedButtonOnPressed,
    getBatchSelectedJobCount,
    previewBatchSelectedJob,
    checkJobHaveBin,
    getJobBinInfo,
    setIsFoodWasteJob,
    completeJobBinDelivery,
  } = usePocAction(route, navigation);

  const [isLoading, setLoading] = useState(false);
  const [jobBinTotalWeight, setJobBinTotalWeight] = useState(0);
  const [jobBinTotalQuantity, setJobBinTotalQuantity] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [isShowConfirmation, setIsShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchCheckJobHaveBin = async () => {
      try {
        const isJobHaveBin = await checkJobHaveBin();
        setIsFoodWasteJob(isJobHaveBin);
      } catch (error) {
        console.error('Error fetching job bin data:', error);
      }
    };

    fetchCheckJobHaveBin();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isFoodWasteJob) {
          const jobBins = await getJobBinInfo();
          const noRejectJobBins = jobBins.filter((b) => !b.isReject);
          const binsQuantity = noRejectJobBins.length;
          setJobBinTotalQuantity(binsQuantity);

          const binsWeight = jobBins.reduce(
            (total, {weight = 0}) => total + weight,
            0,
          );
          setJobBinTotalWeight(binsWeight);
        }
      } catch (error) {
        console.error('Error fetching job bin data:', error);
      }
    };

    fetchData();
  }, [isFoodWasteJob]);

  const handleButtonClick = async () => {
    setLoading(true);
    if (isFoodWasteJob) {
      const isPartialDelivery = jobBinTotalQuantity < job.totalQuantity;
      await completeJobBinDelivery(isPartialDelivery);
    } else {
      await completeButtonOnPressed();
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

  return (
    <View
      style={styles.pocContainer}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}>
      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading2}
      />
      <ScrollView style={styles.pocContent}>
        <Text style={styles.trackingNum}>{trackNumModel.trackingNum}</Text>
        <Text style={styles.name}>{consigneeName}</Text>
        <Text style={styles.label}>{translationString.address}</Text>
        <TouchableOpacity
          onPress={() => setIsShowConfirmation(true)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
          }}>
          <Text
            style={[
              styles.value,
              styles.addressText,
              {flexWrap: 'wrap', maxWidth: '90%'},
            ]}>
            {job.destination}
          </Text>
          <Image style={[styles.mapIcon, {marginLeft: 5}]} source={MapIcon} />
        </TouchableOpacity>
        <Text style={styles.label}>{translationString.remark}</Text>
        <Text style={[styles.value, {}]}>{job.remark}</Text>
        {isFoodWasteJob && (
          <>
            <Text style={styles.label}>{translationString.totalBin}</Text>
            <Text style={[styles.value, {}]}>
              {jobBinTotalQuantity} {translationString.pcs}
            </Text>
            <Text style={styles.label}>{translationString.totalWeight}</Text>
            <Text style={[styles.value, {}]}>
              {jobBinTotalWeight} {translationString.kg}
            </Text>
          </>
        )}
        <CustomDialogView
          onLeftClick={() => setIsShowConfirmation(false)}
          onRightClick={() => openAddressInMap(job.destination)}
          description={translationString.redirectMapDialogDescription}
          title={translationString.redirectMapDialogTitle}
          isShow={isShowConfirmation}
        />
      </ScrollView>
      {isAllowBatchAction && (
        <TouchableOpacity
          style={styles.batchActionButton}
          onPress={previewBatchSelectedJob}
          disabled={isLoading}>
          <Text style={styles.batchActionButtonText}>
            {translationString.batchPOD} -
            {translationString.formatString(
              translationString.selected_title,
              getBatchSelectedJobCount(),
            )}
          </Text>
        </TouchableOpacity>
      )}
      <View
        style={[
          styles.pocBottomButtonContainer,
          {width, height: height * 0.2},
        ]}>
        <TouchableHighlight
          underlayColor={Constants.Light_Grey_Underlay}
          style={[
            styles.pocFailButton,
            {
              width: width * 0.5,
            },
          ]}
          onPress={() => failedButtonOnPressed()}>
          <View>
            <Image style={styles.pocIcon} source={FailedIcon} />
            <Text style={styles.pocFailButtonText}>
              {translationString.failed}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={Constants.Green_Underlay}
          style={[
            styles.pocCompleteButton,
            {
              width: width * 0.5,
            },
          ]}
          disabled={isLoading}
          onPress={handleButtonClick}>
          <View style={styles.button}>
            <Image style={styles.pocIcon} source={CompleteIcon} />
            <Text style={styles.pocCompleteButtonText}>
              {translationString.completed}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pocContainer: {
    flex: 1,
    backgroundColor: Constants.Dark_Grey,
  },
  pocContent: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 40,
  },
  pocBottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  content: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  name: {
    fontSize: 30,
    color: 'white',
    fontFamily: Constants.NoboSansBoldFont,
    marginTop: 10,
  },
  label: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
    marginTop: 40,
    marginBottom: 5,
    color: 'white',
  },
  value: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  trackingNum: {
    fontSize: Constants.buttonFontSize,
    color: 'white',
    fontFamily: Constants.NoboSansFont,
    marginBottom: 10,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pocFailButton: {
    height: '100%',
    backgroundColor: Constants.Light_Grey,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pocFailButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.Dark_Grey,
    textAlign: 'center',
    alignSelf: 'center',
  },
  pocCompleteButton: {
    height: '100%',
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pocCompleteButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansBoldFont,
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
  },
  pocIcon: {
    margin: 6,
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
  addressText: {
    textDecorationLine: 'underline',
  },
  mapIcon: {
    marginLeft: 5,
    width: 28,
    height: 28,
  },
});
