import React, {FC, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useMarketPlaceItem} from './useMarketPlaceItem';
import * as Constants from '../../CommonConfig/Constants';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {ImageRes} from '../../Assets';
import {translationString} from '../../Assets/translation/Translation';
import store from '../../Reducers';
import {Job} from '../../Model/Job';
import {Language} from '../../Model/Langauge';

type MarketPlaceItemProps = {
  onDeleteClick: (job: Job) => void;
  onClick: (job: Job) => void;
  data: Job;
};

export const MarketPlaceConfirmItem: FC<MarketPlaceItemProps> = (props) => {
  const {onDeleteClick, onClick} = props;
  const [data, setData] = useState<Job>(props.data);

  const languageModel = useSelector<typeof store>(
    (state) => state.LanguageReducer,
  ) as Language;
  const {
    statusBarColour,
    getConsigneeTitleWithColon,
    getConsignee,
    getTrackingNumberOrCount,
  } = useMarketPlaceItem(data);

  return (
    <TouchableOpacity
      onPress={() => onClick(data)}
      style={styles.baseContainer}>
      <View
        style={[
          styles.statusContainer,
          {backgroundColor: statusBarColour(data.status)},
        ]}
      />
      <View style={styles.container}>
        <View style={styles.receiverContainer}>
          {/* <Text style={styles.receiverLabel}>Index: {index}</Text> */}
          <Text style={styles.receiverLabel}>
            {getConsigneeTitleWithColon()}{' '}
          </Text>
          <Text style={styles.receiverName}>{getConsignee()}</Text>

          <View style={styles.horizontalContainer}>
            {data.codAmount > 0 && (
              <Image style={styles.smallIcon} source={ImageRes.CashIcon} />
            )}
            {data.jobType === Constants.JobType.DELIVERY && (
              <Image
                style={styles.smallIcon}
                source={
                  languageModel.code !== 'zh-Hants'
                    ? ImageRes.DeliverEnglishIcon
                    : ImageRes.DeliverIcon
                }
              />
            )}
            {data.jobType === Constants.JobType.PICK_UP && (
              <Image
                style={styles.smallIcon}
                source={
                  languageModel.code !== 'zh-Hants'
                    ? ImageRes.PickUpEnglishIcon
                    : ImageRes.PickUpIcon
                }
              />
            )}
          </View>
        </View>
        <TouchableOpacity>
          <Text
            style={[
              styles.doNum,
              {
                textDecorationLine: getTrackingNumberOrCount().isUnderline
                  ? 'underline'
                  : 'none',
              },
            ]}>
            {getTrackingNumberOrCount().trackingNum}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.receiverName}>Job ID {data.id}</Text>
        <Text style={styles.address}>{data.destination}</Text>
        <View style={styles.divider} />
        <View style={styles.horizontalContainer}>
          <Text style={styles.quantity}>
            {translationString.formatString(
              translationString.total_qty,
              data.totalQuantity,
            )}
          </Text>
          {/* <Text style={styles.quantity}>{translationString.formatString(translationString.total_weight, 2)}</Text> */}
          <Text style={styles.quantity}>
            {translationString.formatString(
              translationString.total_vol,
              data.totalCbm,
            )}
          </Text>
        </View>
        <Text style={styles.remark}>
          {translationString.remark + data.remark}
        </Text>
        <View style={styles.bottomContainer}>
          {data?.errorModel ? (
            <>
              <View style={styles.errorDot} />
              <Text style={styles.errorText}>
                {data?.errorModel?.errorMessage}
              </Text>
            </>
          ) : (
            <View style={{flex: 1}} />
          )}
          <TouchableOpacity
            onPress={() => {
              onDeleteClick(data);
            }}>
            <Text style={styles.deleteButton}>{translationString.delete}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    width: 11,
  },
  requestContainer: {
    flex: 2,
    flexDirection: 'row',
  },
  quantity: {
    color: '#A0A0A0',
    marginBottom: 8,
    flex: 1,
  },
  remark: {
    marginBottom: 16,
    color: '#A0A0A0',
  },
  receiverContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  receiverName: {
    flex: 1,
    marginLeft: 4,
    color: '#A0A0A0',
    fontSize: 18,
  },
  address: {
    marginTop: 8,
    marginBottom: 16,
    color: Constants.Dark_Grey,
    fontSize: 28,
  },
  receiverLabel: {
    color: '#A0A0A0',
    fontSize: 18,
  },
  doNum: {
    color: '#A0A0A0',
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  smallIcon: {
    marginLeft: 8,
  },
  selectedContainer: {
    position: 'absolute',
    borderRadius: 2,
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
    zIndex: 5,
    backgroundColor: '#00000070',
    justifyContent: 'center',
    alignItems: 'center',
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
  bottomContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  errorDot: {
    alignSelf: 'center',
    height: 16,
    width: 16,
    borderRadius: 10,
    backgroundColor: 'red',
  },
  errorText: {
    color: 'red',
    marginLeft: 8,
    fontSize: 18,
    alignSelf: 'center',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: 'gray',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: 'white',
    alignSelf: 'center',
  },
});
