import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableHighlight,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import * as Constants from '../../../../CommonConfig/Constants';
import CompleteIcon from '../../../../Assets/image/icon_success.png';
import ContactIcon from '../../../../Assets/image/icon_big_phone.png';
import {translationString} from '../../../../Assets/translation/Translation';
import {useCodAction} from '../../../../Hooks/JobList/Action/COD/useCodAction';

export default ({route, navigation}) => {
  const {
    callButtonOnPressed,
    completeButtonOnPressed,
    codValueOnChange,
    onEndEditCodValue,
    getIsNotEditable,
    modalCancelButtonOnPressed,
    modalConfirmButtonOnPressed,
    job,
    orderList,
    totalExpectedCodAmt,
    totalActualCodAmt,
    isShowModalVisible,
  } = useCodAction(route, navigation);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  return (
    <View
      style={styles.baseContainer}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}>
      <View>
        <FlatList
          style={[styles.flatlist, {width, height: height * 0.7}]}
          data={orderList}
          renderItem={({item, index}) => (
            <View
              style={[
                styles.orderItemContainer,
                {
                  width: width * 0.95,
                  height: height * 0.15,
                },
              ]}>
              <View style={styles.infoContainer}>
                <Text style={styles.orderItemLabel}>Order Number:</Text>
                <Text style={styles.orderItemLabel}>{item.orderNumber}</Text>
                <Text style={styles.codValue}>
                  Expected COD: {item.codCurrency} {item.codAmount.toFixed(1)}
                </Text>
              </View>

              <TextInput
                editable={!getIsNotEditable()}
                style={styles.textInput}
                onChangeText={(text) => codValueOnChange(text, item, index)}
                onEndEditing={(e) => {
                  onEndEditCodValue(e.nativeEvent.text, item, index);
                }}
                value={item.codValueString ? item.codValueString : ``}
                textAlign={'right'}
                keyboardType={'decimal-pad'}
              />
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
      <View style={styles.separator} />
      <View
        style={[
          styles.bottomHorizontalContainer,
          {
            width: width * 0.9,
            height: height * 0.05,
            marginHorizontal: width * 0.05,
          },
        ]}>
        <Text style={styles.totalLabel}>
          {translationString.confirm_total_cod}
        </Text>
        <Text style={styles.totalLabel}>
          {job.codCurrency ? job.codCurrency : ''}{' '}
          {totalExpectedCodAmt.toFixed(2)}
        </Text>
      </View>
      <View
        style={[
          styles.bottomHorizontalContainer,
          {
            width: width * 0.9,
            height: height * 0.05,
            marginHorizontal: width * 0.05,
          },
        ]}>
        <Text style={styles.totalLabel}>
          {translationString.confirm_total_act_cod}
        </Text>
        <Text style={styles.actualCOD}>
          <Text style={[styles.actualCOD, {color: 'rgb(136, 136, 136)'}]}>
            {job.codCurrency ? job.codCurrency : ''}{' '}
          </Text>
          {totalActualCodAmt ? totalActualCodAmt.toFixed(2) : '0.00'}
        </Text>
      </View>
      <View
        style={[
          styles.buttonBottomButtonContainer,
          {width, height: height * 0.2},
        ]}>
        <TouchableHighlight
          underlayColor={Constants.Light_Grey_Underlay}
          style={[styles.callButton, {width: width * 0.5, height: '100%'}]}
          onPress={callButtonOnPressed}>
          <View style={styles.button}>
            <Image style={styles.icon} source={ContactIcon} />
            <Text style={styles.confirmButtonText}>
              {translationString.call}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={Constants.Green_Underlay}
          style={[styles.confirmButton, {width: width * 0.5, height: '100%'}]}
          onPress={completeButtonOnPressed}>
          <View style={styles.button}>
            <Image style={styles.icon} source={CompleteIcon} />
            <Text style={styles.confirmButtonText}>
              {translationString.confirm}
            </Text>
          </View>
        </TouchableHighlight>
      </View>

      <Modal
        visible={isShowModalVisible}
        animationType="fade"
        transparent={true}>
        <View style={styles.darkBackground}>
          <View style={[styles.content, {width: width * 0.9}]}>
            <Text style={styles.messageText}>
              {translationString.collect_cod_message}
            </Text>
            <View style={styles.modalHorizontalContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={modalCancelButtonOnPressed}>
                <Text style={styles.modalButtonText}>
                  {translationString.cancel_btn.toUpperCase()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={modalConfirmButtonOnPressed}>
                <Text style={styles.modalButtonText}>
                  {translationString.confirm.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  flatlist: {
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    fontWeight: '500',
    color: 'black',
  },
  infoContainer: {
    flex: 1,
  },
  orderItemContainer: {
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 2,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  orderItemLabel: {
    fontSize: Constants.textInputFonSize,
    fontFamily: Constants.NoboSansFont,
    color: 'rgb(144, 144, 144)',
  },
  codValue: {
    fontSize: Constants.textInputFonSize,
    fontFamily: Constants.NoboSansFont,
    color: 'rgb(175, 175, 175)',
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Constants.Pending_Color,
    width: 100,
    fontSize: Constants.textInputFonSize,
    padding: 10,
    borderRadius: 5,
    marginLeft: 8,
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
  separator: {
    marginHorizontal: 20,
    marginVertical: 5,
    height: 1,
    backgroundColor: Constants.Pending_Color,
  },
  bottomHorizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: Constants.NoboSansFont,
    color: Constants.Dark_Grey,
  },
  actualCOD: {
    fontSize: 25,
    fontFamily: Constants.NoboSansFont,
    fontWeight: '500',
    color: Constants.THEME_COLOR,
  },
  buttonBottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: Constants.Shipping_Color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: Constants.screenWidth - 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -50,
  },
  messageText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: Constants.Dark_Grey,
  },
  modalHorizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    marginLeft: 20,
  },
  modalButtonText: {
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansFont,
    color: Constants.THEME_COLOR,
  },
});
