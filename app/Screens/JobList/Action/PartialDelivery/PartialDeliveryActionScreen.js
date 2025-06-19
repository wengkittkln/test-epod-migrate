import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableHighlight,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import * as Constants from '../../../../CommonConfig/Constants';
import {usePartialDeliveryAction} from '../../../../Hooks/JobList/Action/PartialDelivery/usePartialDeliveryAction';
import CompleteIcon from '../../../../Assets/image/icon_success.png';
import {translationString} from '../../../../Assets/translation/Translation';
import ConfirmQtyItem from '../../../../Components/JobItem/ConfirmQtyItem';

export default ({route, navigation}) => {
  const {
    completeButtonOnPressed,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    getExpensiveColor,
    orderItemList,
    totalSum,
    total,
  } = usePartialDeliveryAction(route, navigation);
  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{flex: 1}}
      keyboardVerticalOffset={60}>
      <View style={styles.baseContainer}>
        <FlatList
          style={styles.flatlist}
          data={orderItemList}
          renderItem={({item, index}) => {
            const expensiveColor = getExpensiveColor();
            return ConfirmQtyItem({
              item,
              index,
              expensiveColor,
              minusButtonOnPressed,
              onQuantityTextInputOnChange,
              addButtonOnPressed,
            });
          }}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <Text style={styles.headerTitle}>
              {translationString.formatString(
                translationString.partial_delivery_amount,
                `${total}/${totalSum}`,
              )}
            </Text>
          )}
        />
        <TouchableHighlight
          underlayColor={Constants.Green_Underlay}
          disabled={totalSum === total ? true : false}
          onPress={() => completeButtonOnPressed(null)}
          style={[
            styles.confirmButton,
            {
              backgroundColor:
                totalSum === total
                  ? Constants.Pending_Color
                  : Constants.Completed_Color,
            },
          ]}>
          <View style={styles.button}>
            <Image style={styles.buttonIcon} source={CompleteIcon} />
            <Text style={styles.confirmButtonText}>
              {translationString.confirm}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgrey',
    width: 80,
    fontSize: Constants.buttonFontSize,
    marginVertical: 10,
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
});
