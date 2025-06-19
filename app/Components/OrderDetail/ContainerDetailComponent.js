/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import {
  useOrderDetailComponent,
  useContainerDetailComponent,
} from './useOrderDetailComponent';

const GenerateItemList = (item, index, getTotalQuantity) => {
  return (
    <View key={item.id}>
      <Text style={styles.orderItem}>
        {index + 1}
        {'.   '}
        {item.sku}
      </Text>
      <View style={{display: 'flex', flexDirection: 'row'}}>
        <Text style={styles.actualQunatity}>{getTotalQuantity(item)}</Text>
      </View>
    </View>
  );
};

const ContainerDetailComponent = ({containerList, job}) => {
  const {getTotalQuantity} = useContainerDetailComponent(job);
  return (
    <View style={styles.orderDetailContainer}>
      <Text style={styles.productLabel}>{translationString.container}:</Text>
      {containerList.map((item, index) =>
        GenerateItemList(item, index, getTotalQuantity),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orderDetailContainer: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'lightgrey',
    marginTop: 10,
    padding: 10,
    paddingHorizontal: 16,
  },
  productLabel: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginBottom: 8,
    color: 'black',
    textDecorationLine: 'underline',
  },
  orderItem: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    color: 'black',
  },
  actualQunatity: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 18,
    marginVertical: 16,
    color: 'black',
  },
});

export default ContainerDetailComponent;
