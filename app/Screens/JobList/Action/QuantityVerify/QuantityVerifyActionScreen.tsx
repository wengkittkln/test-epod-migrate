import React, {useLayoutEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import * as Constants from '../../../../CommonConfig/Constants';
import {useQuantityVerifyAction} from '../../../../Hooks/JobList/Action/QuantityVerify/useQuantityVerifyAction';
import {translationString} from '../../../../Assets/translation/Translation';
import VerifyQtyItem from '../../../../Components/JobItem/VerifyQtyItem';
import {ImageRes} from '../../../../Assets';
import OrderItemsModel from '../../../../Components/OrderItem/OrderItemsModel';
import {VerifyOrderList} from '../../../../Model/Order';

export default ({route, navigation}) => {
  const [isSearch, setIsSearch] = useState(false);

  const {
    completeButtonOnPressed,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    searchItem,
    cancelConfirm,
    backOnPress,
    totalSum,
    total,
    isDisabled,
    orderList,
    job,
    orderItemList,
    isShowSummary,
    needSummary,
    orderListBackup,
  } = useQuantityVerifyAction(route, navigation);

  useLayoutEffect(() => {
    navigation.setOptions({
      // headerTitle: isSearch
      //   ? ''
      //   : translationString.confirm_partial_delivery_amount,
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            backOnPress(isShowSummary);
          }}>
          <Image source={ImageRes.BackButton} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {isSearch && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => searchItem(text)}
                textAlign="right"
              />
              <TouchableOpacity
                style={[Constants.navStyles.navButton, {flex: 1}]}
                onPress={() => {
                  searchItem('');
                  setIsSearch(false);
                }}>
                <Image source={ImageRes.CloseIcon} />
              </TouchableOpacity>
            </View>
          )}
          {!isSearch && (
            <Text style={styles.headerTitleStyle}>
              {translationString.confirm_partial_delivery_amount}
            </Text>
          )}
        </View>
      ),
      headerRight: () => (
        <View>
          {!isSearch && (
            <TouchableOpacity
              style={Constants.navStyles.navButton}
              onPress={() => {
                setIsSearch(true);
              }}>
              <Image source={ImageRes.SearchIcon} />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, isShowSummary, isSearch, orderListBackup]);

  return (
    <SafeAreaView
      // behavior="padding"
      style={{flex: 1}}
      // keyboardVerticalOffset={60}
    >
      <View style={styles.baseContainer}>
        {/* {!isShowSummary && ( */}
        <FlatList
          style={[styles.flatlist, {padding: 0}]}
          data={orderList}
          keyExtractor={(item) => item.orderNumber}
          renderItem={({item, index}) => {
            const parentIndex = index;
            return (
              <View>
                <Text style={styles.headerTitle}>
                  {'  ' +
                    (item.orderNumber === '_Container_'
                      ? translationString.container + ': '
                      : 'OrderNumber: ' + item.orderNumber)}
                </Text>
                <FlatList
                  style={styles.flatlist}
                  data={item.item}
                  renderItem={({item, index}) =>
                    VerifyQtyItem({
                      item,
                      index,
                      parentIndex,
                      minusButtonOnPressed,
                      onQuantityTextInputOnChange,
                      addButtonOnPressed,
                      isShowSummary,
                    })
                  }
                  keyExtractor={(item) => item.id.toString()}
                />
              </View>
            );
          }}
          ListHeaderComponent={() => (
            <Text style={styles.headerTitle}>
              {'  ' +
                translationString.formatString(
                  translationString.partial_delivery_amount,
                  `${total}/${totalSum}`,
                )}
            </Text>
          )}
        />
        <TouchableHighlight
          underlayColor={Constants.Green_Underlay}
          disabled={isDisabled || !total || (!total && total === 0)}
          onPress={completeButtonOnPressed}
          style={[
            styles.confirmButton,
            {
              backgroundColor:
                totalSum === total && total > 0
                  ? Constants.Completed_Color
                  : !total
                  ? Constants.Disable_Color
                  : Constants.Partial_Delivery_Color,
            },
          ]}>
          <View style={styles.button}>
            <Image style={styles.buttonIcon} source={ImageRes.CompleteIcon} />
            <Text style={styles.confirmButtonText}>
              {needSummary && !isShowSummary
                ? translationString.viewSummary
                : totalSum === total
                ? translationString.confirm
                : translationString.partial_delivery}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  flatlist: {
    flex: 1,
    padding: 10,
  },
  headerTitle: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    fontWeight: '500',
    color: 'black',
  },
  labelContainer: {flexDirection: 'row', flex: 1, marginRight: 10},
  labelHorizontalContainer: {
    flexDirection: 'row',
  },
  orderItemContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  orderItemIndexLabel: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: 'rgb(134, 134, 134)',
  },
  orderItemLabel: {
    marginLeft: 8,
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: 'rgb(134, 134, 134)',
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 5,
    flex: 1,
    flexWrap: 'wrap',
  },
  textInput: {
    // flex:1,
    marginRight: '5%',
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
    width: '85%',
    marginLeft: 16,
    color: 'white',
    fontSize: Constants.textInputFonSize,
    fontFamily: Constants.fontFamily,
  },
  confirmButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    fontSize: 24,
    fontFamily: Constants.NoboSansBoldFont,
    color: 'white',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    margin: 6,
  },
  icon: {
    padding: 0,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  itemTitle: {
    fontSize: 18,
    paddingEnd: 16,
    paddingStart: 16,
    paddingTop: 8,
    paddingBottom: 4,
    color: Constants.Order_Item_Color,
    flex: 3,
  },
  itemQtyValue: {
    fontSize: 18,
    flex: 1,
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 8,
    alignSelf: 'flex-end',
    color: Constants.Order_Item_Color,
    textAlign: 'right',
    paddingBottom: 4,
  },
  headerTitleStyle: {
    color: 'white',
    fontSize: 20,
    fontFamily: Constants.fontFamily,
    fontWeight: '500',
  },
});
