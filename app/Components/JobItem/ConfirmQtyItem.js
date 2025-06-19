import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import DarkAddIcon from '../../Assets/image/icon_add_dark.png';
import LightAddIcon from '../../Assets/image/icon_add_grey.png';
import DarkMinusIcon from '../../Assets/image/icon_minus_dark.png';
import LightMinusIcon from '../../Assets/image/icon_minus_grey.png';

const ConfirmQtyItem = ({
  item,
  index,
  expensiveColor,
  minusButtonOnPressed,
  onQuantityTextInputOnChange,
  addButtonOnPressed,
}) => {
  return (
    <View
      style={[
        styles.orderItemContainer,
        {
          backgroundColor: item.isExpensive ? expensiveColor : 'transparent',
        },
      ]}>
      <View style={styles.labelContainer}>
        <View style={styles.labelHorizontalContainer}>
          <Text style={styles.orderItemIndexLabel}>{index + 1}.</Text>
        </View>
        <Text style={styles.orderItemLabel}>
          {'OrderNumber: \n'}
          {item.orderNumber}
          {'\n'}
          {item.description} ({item.expectedQuantity} {item.uom})
        </Text>
      </View>

      <View style={styles.horizontalContainer}>
        <TouchableOpacity
          style={styles.icon}
          disabled={item.quantity === 0}
          onPress={() => minusButtonOnPressed(item, index)}>
          <Image
            source={item.quantity === 0 ? LightMinusIcon : DarkMinusIcon}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) =>
            onQuantityTextInputOnChange(text, item, index)
          }
          value={item.quantity.toString()}
          textAlign="center"
          keyboardType="number-pad"
        />
        <TouchableOpacity
          style={styles.icon}
          disabled={item.quantity === item.expectedQuantity}
          onPress={() => addButtonOnPressed(item, index)}>
          <Image
            source={
              item.quantity === item.expectedQuantity
                ? LightAddIcon
                : DarkAddIcon
            }
          />
        </TouchableOpacity>
      </View>
    </View>
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

export default ConfirmQtyItem;
