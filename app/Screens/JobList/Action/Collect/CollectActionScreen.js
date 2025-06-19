/* eslint-disable react-hooks/exhaustive-deps */
import React, {useLayoutEffect, useState, useEffect} from 'react';
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
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import {translationString} from '../../../../Assets/translation/Translation';
import PullUpIcon from '../../../../Assets/image/icon_pull.png';
import * as Constants from '../../../../CommonConfig/Constants';
import {useCollectAction} from '../../../../Hooks/JobList/Action/Collect/useCollectAction';
import ViewIcon from '../../../../Assets/image/icon_view_white.png';
import HideIcon from '../../../../Assets/image/icon_hide_white.png';

export default ({route, navigation}) => {
  const {
    job,
    consigneeName,
    trackNumModel,
    stepCode,
    actionModel,
    photoTaking,
    isFoodWasteJob,
    getJobBinInfo,
    checkJobHaveBin,
    setIsFoodWasteJob,
    completeJobBinCollection,
    isShowDecrypt,
    decryptedConsignee,
    getDecryptData,
  } = useCollectAction(route, navigation);

  const [jobBinTotalWeight, setJobBinTotalWeight] = useState(0);
  const [jobBinTotalQuantity, setJobBinTotalQuantity] = useState(0);
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
          const jobBins = await getJobBinInfo(job.id);
          const binsQuantity = jobBins.length;
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

  return (
    <View style={styles.baseContainer}>
      <ScrollView>
        <View style={styles.content}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <Text style={styles.trackingNum}>{trackNumModel.trackingNum}</Text>
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
                  <Image style={[{height: 20, width: 20}]} source={HideIcon} />
                ) : (
                  <Image style={[{height: 20, width: 20}]} source={ViewIcon} />
                )}
                <Text style={[{marginLeft: 5}, {color: 'white'}]}>
                  {translationString.reveal}
                </Text>
              </View>
            </Pressable>
          </View>
          <Text style={styles.name}>
            {isShowDecrypt ? decryptedConsignee : consigneeName}
          </Text>
          <Text style={styles.label}>{translationString.address}</Text>
          <Text style={styles.value}>{job.destination}</Text>
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
        </View>
      </ScrollView>

      <GestureRecognizer
        onSwipeUp={(state) => {
          isFoodWasteJob
            ? completeJobBinCollection()
            : navigation.navigate('CollectOrderItemList', {
                job: job,
                consigneeName: consigneeName,
                trackNumModel: trackNumModel,
                stepCode: stepCode,
                actionModel: actionModel,
                photoTaking: photoTaking,
              });
        }}>
        <Pressable
          style={styles.swipeUpButton}
          onPress={() => {
            isFoodWasteJob
              ? completeJobBinCollection()
              : navigation.navigate('CollectOrderItemList', {
                  job: job,
                  consigneeName: consigneeName,
                  trackNumModel: trackNumModel,
                  stepCode: stepCode,
                  actionModel: actionModel,
                  photoTaking: photoTaking,
                });
          }}>
          <View style={styles.button}>
            <Image style={styles.icon} source={PullUpIcon} />
            <Text style={styles.completeButtonText}>
              {translationString.please_pull}
            </Text>
          </View>
        </Pressable>
      </GestureRecognizer>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: Constants.Dark_Grey,
  },
  content: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 40,
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
    marginBottom: 6,
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
  swipeUpButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    margin: 6,
  },
  completeButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansBoldFont,
    color: 'white',
    paddingVertical: 10,
  },
});
