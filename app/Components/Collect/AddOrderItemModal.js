import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import DarkAddIcon from '../../Assets/image/icon_add_dark.png';
import DarkMinusIcon from '../../Assets/image/icon_minus_dark.png';
import LightMinusIcon from '../../Assets/image/icon_minus_grey.png';
import ModalSelector from 'react-native-modal-selector';
import {useAddOrderItemModal} from './useAddOrderItemModal';

const AddOrderItemModal = ({
  closeOnPressed = () => {},
  addOrderItem = (orderItemModel) => {},
}) => {
  const {
    orderItemModel,
    selectedKey,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    selectedOption,
    productNameOnchangeText,
    inputValidation,
  } = useAddOrderItemModal(addOrderItem);
  return (
    <View style={styles.darkBackground}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={styles.modelView}>
          <Text style={styles.modelTitle}>{translationString.add_item}</Text>
          <View style={styles.divider} />
          <Text style={styles.modelText}>
            {translationString.please_enter_item_name}
          </Text>
          <View style={styles.productNameContainer}>
            <TextInput
              style={styles.productNameInput}
              onChangeText={productNameOnchangeText}
              autoCapitalize={'none'}
              value={orderItemModel.description}
            />
          </View>
          <Text style={styles.modelText}>
            {translationString.please_enter_item_no}
          </Text>

          <View style={styles.rowContainer}>
            <View style={styles.addMinusContainer}>
              <TouchableOpacity
                style={styles.icon}
                disabled={orderItemModel.quantity === 0}
                onPress={minusButtonOnPressed}>
                <Image
                  source={
                    orderItemModel.quantity === 0
                      ? LightMinusIcon
                      : DarkMinusIcon
                  }
                />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                onChangeText={(text) => onQuantityTextInputOnChange(text)}
                value={orderItemModel.quantity.toString()}
                textAlign="center"
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={styles.icon}
                onPress={addButtonOnPressed}>
                <Image source={DarkAddIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.uomContainer}>
              <ModalSelector
                initValueTextStyle={{
                  fontWeight: '600',
                  width: Constants.screenWidth / 2 - 50,
                }}
                initValue=""
                selectStyle={{
                  borderColor: 'transparent',
                }}
                selectedKey={selectedKey}
                animationType={'fade'}
                sectionStyle={{width: 100, flex: 1}}
                data={Constants.uomList}
                keyExtractor={(item) => item.key}
                labelExtractor={(item) => item.label}
                onChange={(option) => {
                  selectedOption(option);
                }}></ModalSelector>
            </View>
          </View>

          <View style={styles.rowContainerConfirmation}>
            <TouchableOpacity
              underlayColor={Constants.Light_Grey_Underlay}
              style={styles.cancelButtonContainer}
              onPress={closeOnPressed}>
              <Text style={styles.cancelModelButton}>
                {translationString.cancel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              underlayColor={Constants.Green_Underlay}
              style={styles.confirmModalButtonContainer}
              onPress={inputValidation}>
              <Text style={styles.confirmModelButton}>
                {translationString.confirm}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelView: {
    width: Constants.screenWidth - 20,
    backgroundColor: Constants.WHITE,
    borderRadius: 8,
  },
  modelTitle: {
    fontSize: 20,
    alignSelf: 'center',
    color: Constants.Dark_Grey,
    paddingTop: 16,
    paddingBottom: 8,
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  modelText: {
    fontSize: 24,
    color: Constants.Dark_Grey,
    padding: 20,
  },
  productNameContainer: {
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: Constants.Light_Grey,
  },
  productNameInput: {
    padding: 16,
    fontSize: Constants.buttonFontSize,
  },

  addMinusContainer: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
  },
  uomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 8,
    minHeight: 50,
    backgroundColor: Constants.Light_Grey,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowContainerConfirmation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Light_Grey,
    borderBottomLeftRadius: 8,
  },
  confirmModalButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Completed_Color,
    borderBottomRightRadius: 8,
  },
  cancelModelButton: {
    fontSize: 18,
    color: Constants.Dark_Grey,
    alignSelf: 'center',
    padding: 16,
  },
  confirmModelButton: {
    fontSize: 18,
    color: Constants.WHITE,
    alignSelf: 'center',
    padding: 16,
  },
  icon: {
    padding: 0,
  },
  textInput: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgrey',
    flex: 1,
    fontSize: Constants.buttonFontSize,
  },
});
export default AddOrderItemModal;
