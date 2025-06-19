import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import * as Constants from '../CommonConfig/Constants';
import {ImageRes} from '../Assets';

const JobRequestItem = ({
  item,
  onPress,
  translationString,
  languageModel,
  type = 'pending',
}) => {
  const getStatusColor = () => {
    switch (type) {
      case 'pending':
        return 'grey';
      case 'sent':
        return item.status.toUpperCase() === 'APPROVED'
          ? '#4CAF50'
          : item.status.toUpperCase() === 'REJECTED'
          ? 'red'
          : 'grey';
      case 'available':
        return '#2196F3';
      default:
        return 'grey';
    }
  };

  const getStatusText = () => {
    switch (type) {
      case 'pending':
        return translationString.pending || 'Pending';
      case 'sent':
        return item.status.toUpperCase() === 'APPROVED'
          ? translationString.approved || 'Approved'
          : item.status.toUpperCase() === 'REJECTED'
          ? translationString.job_transfers.rejected
          : translationString.pending || 'Pending';
      case 'available':
        return translationString.available || 'Available';
      default:
        return '';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return (
      pad(date.getDate()) +
      '/' +
      pad(date.getMonth() + 1) +
      '/' +
      date.getFullYear() +
      ' ' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  };

  return (
    <View style={styles.baseContainer}>
      <View
        style={[styles.statusContainer, {backgroundColor: getStatusColor()}]}
      />
      <TouchableOpacity
        onPress={() => onPress(item)}
        disabled={item.status.toUpperCase() === 'REJECTED' ? true : false}
        style={styles.itemContainer}>
        <View style={styles.jobInfoContainer}>
          {type !== 'pending' ? (
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, {color: 'black'}]}>
                {translationString.owner}: {item.ownerUserName}
              </Text>
            </View>
          ) : (
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, {color: 'black'}]}>
                {translationString.applicant}: {item.requesterUserName}
              </Text>
            </View>
          )}
          {type !== 'pending' && (
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, {color: getStatusColor()}]}>
                {getStatusText()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.topRowContainer}>
          <View style={styles.receiverInfoContainer}>
            <Text style={styles.receiverLabel}>
              {item.jobType === Constants.JobType.DELIVERY
                ? translationString.receiver
                : translationString.picker}{' '}
            </Text>
            <Text style={styles.receiverName}>
              {item.consignee}({item.customer})
            </Text>
          </View>
          <View style={styles.horizontalContainer}>
            {item.jobType === Constants.JobType.DELIVERY && (
              <Image
                style={styles.smallIcon}
                source={
                  languageModel.code !== 'zh-Hants'
                    ? ImageRes.DeliverEnglishIcon
                    : ImageRes.DeliverIcon
                }
              />
            )}
            {item.jobType === Constants.JobType.PICK_UP && (
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

        <View style={styles.divider} />
        <Text style={styles.doNum}>Job ID: {item.jobId}</Text>
        <Text style={styles.address}>{item.destination}</Text>
        <View style={styles.divider} />
        <View style={styles.horizontalContainer}>
          <Text style={styles.quantity}>
            {`${translationString.total_qty.replace(
              '{0}',
              item.totalQuantity,
            )}`}
          </Text>
          <Text style={styles.quantity}>
            {`${translationString.total_vol.replace('{0}', item.totalCbm)}`}
          </Text>
        </View>
        <Text style={styles.remark}>
          {translationString.remark} {item.remark}
        </Text>
        {(type === 'sent' || type === 'pending') && item.requestedAt && (
          <Text style={[styles.remark, {marginTop: 4}]}>
            {translationString.request_date || 'Request Date'}:{' '}
            {formatDateTime(item.requestedAt)}
          </Text>
        )}
        {type === 'sent' &&
          item.status.toUpperCase() === 'REJECTED' &&
          item.reason && (
            <Text style={styles.rejectionReason}>
              {translationString.rejection_reason || 'Rejection Reason'}:{' '}
              {item.reason}
            </Text>
          )}
        <View style={{marginBottom: 16}}></View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 9,
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
  itemContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 9,
  },
  statusContainer: {
    width: 11,
  },
  jobInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  topRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  receiverInfoContainer: {
    flex: 1,
  },
  quantity: {
    color: '#A0A0A0',
    marginBottom: 8,
    flex: 1,
  },
  remark: {
    color: '#A0A0A0',
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
    color: 'black',
    fontSize: 30,
  },
  receiverLabel: {
    color: '#A0A0A0',
    fontSize: 18,
  },
  doNum: {
    color: '#A0A0A0',
    fontSize: 14,
    marginVertical: 4,
    fontSize: 16,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  smallIcon: {
    marginLeft: 8,
  },
  statusTextContainer: {
    marginLeft: 0,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectionReason: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
});

export default JobRequestItem;
