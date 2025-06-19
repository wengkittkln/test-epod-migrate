import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';
import DeleteIcon from '../../Assets/image/remove_icon.png';
import * as Constants from '../../CommonConfig/Constants';

const SkuItem = ({item, onDelete, isPD}) => {
  return (
    <View style={styles.baseContainer}>
      <View style={styles.statusContainer} />
      <View style={styles.rightContainer}>
        <View style={styles.receiverContainer}>
          <Text style={styles.titleLabel}>{item.description}</Text>
          {item.skuCode && (
            <TouchableOpacity onPress={() => onDelete(item)}>
              <Image style={styles.iconDelete} source={DeleteIcon} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.divider} />
        <View style={styles.rowContainer}>
          <Text style={styles.leftLabel}>{translationString.amount_item}</Text>
          <Text style={styles.rightLabel}>{item.scannedCount}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftLabel}>
            {translationString.barcode_number}
          </Text>
          <Text style={styles.rightLabel}>{item.skuCode || '-'}</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.leftLabel}>{translationString.remark}</Text>
          <Text style={styles.rightLabel}>{item.remark}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
  },
  leftRowContainer: {
    flex: 0.4,
    flexDirection: 'row',
  },
  rightRowContainer: {
    flex: 0.6,
    flexDirection: 'row',
  },
  leftLabel: {
    fontSize: 18,
    flex: 0.3,
    color: '#A0A0A0',
  },
  rightLabel: {
    fontSize: 18,
    flex: 0.6,
  },
  titleLabel: {
    fontSize: 20,
    flex: 0.9,
    color: 'black',
  },
  iconDelete: {
    marginTop: 6,
    width: 24,
    height: 24,
  },
  halfLeftContainer: {
    flex: 0.4,
    flexDirection: 'row',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 8,
  },
  baseContainer: {
    flexDirection: 'row',
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusContainer: {
    width: 11,
    backgroundColor: Constants.Completed_Color,
  },
  receiverContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
});

export default SkuItem;
