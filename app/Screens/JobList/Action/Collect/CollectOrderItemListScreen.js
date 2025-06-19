import React, {useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  View,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import {translationString} from '../../../../Assets/translation/Translation';
import * as Constants from '../../../../CommonConfig/Constants';
import {useCollectAction} from '../../../../Hooks/JobList/Action/Collect/useCollectAction';
import {useCollectOrderItemList} from '../../../../Hooks/JobList/Action/Collect/useCollectOrderItemList';
import DarkAddIcon from '../../../../Assets/image/icon_add_dark.png';
import LightAddIcon from '../../../../Assets/image/icon_add_grey.png';
import DarkMinusIcon from '../../../../Assets/image/icon_minus_dark.png';
import LightMinusIcon from '../../../../Assets/image/icon_minus_grey.png';
import FailedIcon from '../../../../Assets/image/icon_failed.png';
import CompleteIcon from '../../../../Assets/image/icon_success.png';
import AddOrderItemModal from '../../../../Components/Collect/AddOrderItemModal';

export default ({route, navigation}) => {
  const {
    closeDialog,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    addOrderItem,
    editOrderItem,
    deleteOrderItem,
    closeFailConfirmDialog,
    showFailCollectModal,
    failCollect,
    closeSuccessConfirmDialog,
    collectConfirmOnPress,
    getConfirmPickUpMessage,
    showSuccessCollectModal,
    getItemDescription,
    ref,
    locationModel,
    isModalVisible,
    orderItemList,
    isFailConfirmModalVisible,
    isSuccessModalVisible,
    total,
  } = useCollectOrderItemList(route, navigation);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{flex: 1}}
      keyboardVerticalOffset={60}>
      <View style={styles.baseContainer}>
        <SwipeListView
          ref={ref}
          closeOnRowOpen={true}
          style={styles.flatlist}
          data={orderItemList}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={() => <View style={{height: 8}} />}
          ListHeaderComponent={() => (
            <Text style={styles.headerTitle}>
              {translationString.formatString(
                translationString.total_item_no,
                `${total}`,
              )}
            </Text>
          )}
          renderItem={({item, index}) => (
            <SwipeRow
              disableRightSwipe={true}
              disableLeftSwipe={!item.isAddedFromLocal}
              rightOpenValue={-190}>
              <View style={styles.rowBack}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => editOrderItem(item)}>
                  <Text style={styles.deleteText}>
                    {translationString.edit}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteOrderItem(item, index)}>
                  <Text style={styles.deleteText}>
                    {translationString.select_photo_delete}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.orderItemContainer}>
                <View style={styles.labelContainer}>
                  <View style={styles.labelHorizontalContainer}>
                    <Text style={styles.orderItemIndexLabel}>{index + 1}.</Text>
                  </View>
                  <Text style={styles.orderItemLabel}>
                    {getItemDescription(item)}
                  </Text>
                </View>

                <View style={styles.horizontalContainer}>
                  <TouchableOpacity
                    style={styles.icon}
                    disabled={
                      item.isAddedFromLocal
                        ? item.quantity === 1
                        : item.quantity === 0
                    }
                    onPress={() => minusButtonOnPressed(item, index)}>
                    <Image
                      source={
                        item.quantity === 0 ? LightMinusIcon : DarkMinusIcon
                      }
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.textInput}
                    onChangeText={(text) =>
                      onQuantityTextInputOnChange(text, item, index)
                    }
                    value={item.quantity.toString()}
                    textAlign={'center'}
                    keyboardType={'number-pad'}
                  />
                  <TouchableOpacity
                    style={styles.icon}
                    onPress={() => addButtonOnPressed(item, index)}>
                    <Image source={DarkAddIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            </SwipeRow>
          )}
        />
        <View style={styles.bottomButtonContainer}>
          <TouchableHighlight
            underlayColor={Constants.Light_Grey_Underlay}
            style={styles.failButton}
            onPress={showFailCollectModal}>
            <View style={styles.button}>
              <Image style={styles.icon} source={FailedIcon} />
              <Text style={styles.failButtonText}>
                {translationString.failed}
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={Constants.Green_Underlay}
            style={styles.completeButton}
            onPress={showSuccessCollectModal}>
            <View style={styles.button}>
              <Image style={styles.icon} source={CompleteIcon} />
              <Text style={styles.completeButtonText}>
                {translationString.pickup_btn}
              </Text>
            </View>
          </TouchableHighlight>
        </View>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType={'fade'}>
          <AddOrderItemModal
            closeOnPressed={closeDialog}
            addOrderItem={addOrderItem}
          />
        </Modal>

        <Modal
          visible={isFailConfirmModalVisible}
          transparent={true}
          animationType={'fade'}>
          <View style={styles.darkBackground}>
            <View style={styles.modelView}>
              <Text style={styles.modelTitle}>
                {translationString.confirm_failed_pickup_title}
              </Text>
              <View style={styles.divider} />

              <Text style={styles.modelText}>
                {translationString.are_you_confirm_failed_to_pickup_item}
              </Text>

              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                  underlayColor={Constants.Light_Grey_Underlay}
                  style={styles.cancelButtonContainer}
                  onPress={closeFailConfirmDialog}>
                  <Text style={styles.cancelModelButton}>
                    {translationString.cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  underlayColor={Constants.Red_Underlay}
                  style={styles.failButtonContainer}
                  onPress={failCollect}>
                  <Text style={styles.failModelButton}>
                    {translationString.failed}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isSuccessModalVisible}
          transparent={true}
          animationType={'fade'}>
          <View style={styles.darkBackground}>
            <View style={styles.modelView}>
              <Text style={styles.modelTitle}>
                {translationString.confirm_pickup_item}
              </Text>
              <View style={styles.divider} />

              <Text style={styles.modelText}>{getConfirmPickUpMessage()}</Text>

              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                  underlayColor={Constants.Light_Grey_Underlay}
                  style={styles.cancelButtonContainer}
                  onPress={closeSuccessConfirmDialog}>
                  <Text style={styles.cancelModelButton}>
                    {translationString.cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  underlayColor={Constants.Green_Underlay}
                  style={styles.confirmButton}
                  onPress={collectConfirmOnPress}>
                  <Text style={styles.confirmButtonText}>
                    {translationString.confirm}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    margin: 10,
  },
  labelContainer: {flexDirection: 'row', flex: 1.5, marginRight: 10},
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
    width: 50,
    fontSize: Constants.buttonFontSize,
    marginVertical: 10,
  },
  rowBack: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    width: 95,
    height: '100%',
  },
  editButton: {
    backgroundColor: Constants.Shipping_Color,
    alignItems: 'center',
    justifyContent: 'center',
    width: 95,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    marginTop: 'auto',
    marginBottom: 'auto',
    fontSize: Constants.buttonFontSize,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  failButton: {
    width: Constants.screenWidth / 2,
    backgroundColor: Constants.Light_Grey,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  failButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.Dark_Grey,
    textAlign: 'center',
    alignSelf: 'center',
  },
  completeButton: {
    width: Constants.screenWidth / 2,
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansBoldFont,
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
  },
  icon: {
    padding: 0,
  },
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelView: {
    width: Constants.screenWidth - 20,
    backgroundColor: Constants.WHITE,
    alignSelf: 'center',
    borderRadius: 8,
  },
  modelTitle: {
    fontSize: 20,
    alignSelf: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    color: Constants.Dark_Grey,
  },
  modelText: {
    fontSize: 24,
    alignSelf: 'center',
    padding: 20,
    color: Constants.Dark_Grey,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
  },
  cancelButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Light_Grey,
    borderBottomLeftRadius: 8,
  },
  failButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Constants.Failed_Color,
    borderBottomRightRadius: 8,
  },
  cancelModelButton: {
    fontSize: 18,
    color: Constants.Dark_Grey,
    alignSelf: 'center',
    padding: 16,
  },
  failModelButton: {
    fontSize: 18,
    color: Constants.WHITE,
    alignSelf: 'center',
    padding: 16,
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Completed_Color,
    borderBottomRightRadius: 8,
  },
  confirmButtonText: {
    fontSize: 24,
    fontFamily: Constants.NoboSansBoldFont,
    color: 'white',
  },
  headerTitle: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    fontWeight: '500',
    color: 'black',
  },
});
