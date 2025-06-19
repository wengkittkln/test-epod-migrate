import React from 'react';
import {View, Text, StyleSheet, Image, FlatList} from 'react-native';
import {translationString} from '../../../Assets/translation/Translation';
import * as Constants from '../../../CommonConfig/Constants';
import {TouchableOpacity} from 'react-native-gesture-handler';
import DeleteIcon from '../../../Assets/image/icon_delete.png';

const ScannedItemDetailComponent = ({
  scannedItemsData = [],
  expectedQty = 0,
  removeScannedItemData,
  jobType = Constants.JobType.PICK_UP,
  status = 0,
}) => {
  const ScannedItem = ({sku, weight, id, isReject}) => {
    console.log(isReject);
    return (
      <View style={[styles.itemContainer]}>
        <View style={{width: 120}}>
          <Text
            style={
              isReject
                ? [styles.itemText, {color: 'red'}]
                : [styles.itemText, {color: 'black'}]
            }>
            {sku}
          </Text>
        </View>
        <View style={{width: 70}}>
          <Text
            style={
              isReject
                ? [styles.itemText, {alignSelf: 'flex-end'}, {color: 'red'}]
                : [styles.itemText, {alignSelf: 'flex-end'}, {color: 'black'}]
            }>
            {weight}
          </Text>
        </View>
        <View style={{width: 30}}>
          <Text
            style={
              isReject ? [{color: 'red'}] : [styles.itemText, {color: 'black'}]
            }>
            {translationString.kg}
          </Text>
        </View>
        {jobType === Constants.JobType.PICK_UP && (
          <View style={{width: 50}}>
            <TouchableOpacity
              style={{alignSelf: 'flex-end'}}
              onPress={() => removeScannedItemData(id)}>
              <Image style={styles.iconDelete} source={DeleteIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {jobType === Constants.JobType.PICK_UP
          ? translationString.actualCollectedExpectedQty
          : translationString.actualDeliveredExpectedQty}
      </Text>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityTextBold}>
          {(status === 0 || status === 1) &&
          jobType === Constants.JobType.DELIVERY
            ? 0
            : scannedItemsData.filter((s) => !s.isReject).length}
          {translationString.pcs}
        </Text>
        <Text style={styles.quantityText}>
          / {expectedQty} {translationString.pcs}
        </Text>
      </View>
      {scannedItemsData.length > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.headerRow}>
            <View style={{width: 120}}>
              <Text style={[styles.headerLabel]}>SKU ID</Text>
            </View>
            <View style={{width: 90}}>
              <Text style={[styles.headerLabel, {alignSelf: 'flex-end'}]}>
                {translationString.netWeight}
              </Text>
            </View>

            <View />
          </View>
          <FlatList
            data={scannedItemsData}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <ScannedItem
                sku={item.sku}
                weight={item.weight}
                id={item.id}
                isReject={item.isReject}
              />
            )}
          />
        </>
      )}
    </View>
  );
};

export default ScannedItemDetailComponent;

const styles = StyleSheet.create({
  container: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'lightgrey',
    marginTop: 10,
    padding: 10,
    paddingHorizontal: 16,
  },
  headerText: {
    color: 'grey',
    fontSize: 17,
    padding: 5,
  },
  quantityContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
  },
  quantityTextBold: {
    color: 'black',
    fontWeight: '700',
    fontSize: 20,
  },
  quantityText: {
    color: 'black',
    fontSize: 20,
  },
  divider: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',

    paddingTop: 15,
    paddingHorizontal: 5,
  },
  headerLabel: {
    color: 'grey',
    fontSize: 17,
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 15,
  },
  iconDelete: {
    width: 18,
    height: 18,
    tintColor: 'red',
  },
});
