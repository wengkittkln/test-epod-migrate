/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import {CheckBox} from 'react-native-elements';
import {useEsign} from '../../../../Hooks/JobList/Action/Esign/useEsign';
import * as Constants from '../../../../CommonConfig/Constants';
import {translationString} from '../../../../Assets/translation/Translation';
import ClearIcon from '../../../../Assets/image/icon_clear.png';
import ButtonConfirm from '../../../../Assets/image/icon_continue_big.png';
import PrompGreyIcon from '../../../../Assets/image/icon_promp_grey.png';
import OrderItemsModel from '../../../../Components/OrderItem/OrderItemsModel';
import SignatureCapture from 'react-native-signature-capture';
import {useFocusEffect} from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import EsignJobDetail from '../Esign/EsignJobDetail';

export default ({route, navigation}) => {
  const {
    ref,
    signatureWithOrderNumberRef,
    signatureRef,
    isModalVisible,
    orderList,
    orderItemList,
    quantity,
    checkBoxStatus,
    isSigned,
    orderNumber,
    clearButtonOnPressed,
    nextButtonOnPressed,
    handleSignature,
    handleEmpty,
    getQuantityText,
    getTotalCODText,
    viewOrderItem,
    closeDialog,
    navigateTermAndCondition,
    checkBoxPressed,
    handleEnd,
  } = useEsign(route, navigation);
  const job = route.params.job;
  const screenWidth = Dimensions.get('window').width;
  const dotSize = 5;
  const dotSpacing = 4;
  const numDots = Math.floor(screenWidth / (dotSize + dotSpacing));

  useFocusEffect(
    React.useCallback(() => {
      clearButtonOnPressed();
    }, []),
  );

  return (
    <View style={styles.baseContainer}>
      <View style={styles.topContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.quantityText}>{getQuantityText()}</Text>

          {job.codAmount > 0 && (
            <View style={styles.totalCODContainer}>
              <Text style={styles.totalCODTitle}>
                {translationString.signed_cod}
              </Text>
              <Text style={styles.totalCODText}>{getTotalCODText()}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.arrowButtonContainer}
          onPress={viewOrderItem}>
          <Image style={styles.arrowButton} source={PrompGreyIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{flex: 1}}>
        <EsignJobDetail
          job={job}
          orderNumber={orderNumber}
          totalQuantity={quantity}
          orderItemList={orderItemList}>
          <View style={styles.tncContainer}>
            <View
              ref={signatureWithOrderNumberRef}
              style={{flex: 1}}
              collapsable={false}>
              <View style={styles.orderNumberContainer}>
                <Text style={styles.orderNumber}>{orderNumber}</Text>
              </View>
              <View ref={signatureRef} style={{flex: 1}} collapsable={false}>
                <SignatureCapture
                  ref={ref}
                  style={{flex: 1, height: 200}}
                  square={true}
                  onSaveEvent={handleSignature}
                  onDragEvent={handleEnd}
                  saveImageFileInExtStorage={false}
                  showNativeButtons={false}
                  showTitleLabel={false}
                  showBorder={false}
                  viewMode={'portrait'}
                />
              </View>
            </View>

            <View style={styles.signatureLineContainer}>
              <View style={styles.dotLine}>
                {Array.from({length: numDots}).map((_, index) => (
                  <View key={index} style={styles.dot} />
                ))}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <CheckBox
                containerStyle={styles.tncBackground}
                onPress={checkBoxPressed}
                checked={checkBoxStatus}
              />
              <View style={[styles.rowContainer, {flex: 1}]}>
                <Text style={styles.tncText}>
                  {translationString.tnc_message}
                </Text>
                <TouchableOpacity
                  style={styles.tncTextWithLinkContainer}
                  onPress={navigateTermAndCondition}>
                  <Text style={styles.tncTextWithLink}>
                    {translationString.tnc_title}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </EsignJobDetail>
      </ScrollView>

      <View style={styles.rowContainer}>
        <TouchableOpacity
          underlayColor={Constants.Light_Grey_Underlay}
          style={styles.clearButtonContainer}
          onPress={clearButtonOnPressed}>
          <View style={styles.button}>
            <Image style={styles.icon} source={ClearIcon} />
            <Text style={styles.cleaButton}>{translationString.clear}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          underlayColor={Constants.Green_Underlay}
          style={
            checkBoxStatus && isSigned
              ? styles.nextButtonContainer
              : styles.disableNextButtonContainer
          }
          disabled={!(checkBoxStatus && isSigned)}
          onPress={nextButtonOnPressed}>
          <View style={styles.button}>
            <Image style={styles.icon} source={ButtonConfirm} />
            <Text style={styles.nextButton}>{translationString.next_btn}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modal visible={isModalVisible} transparent={true}>
        <OrderItemsModel
          job={job}
          orders={orderList}
          orderItems={orderItemList}
          isModalVisible={isModalVisible}
          closeOnPressed={closeDialog}
          totalActualCodAmt={route.params?.totalActualCodAmt}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
  },
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  topTextContainer: {
    flexDirection: 'row',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: Constants.WHITE,
    padding: 16,
  },
  quantityText: {
    flex: 1,
    fontSize: 14,
    color: Constants.Dark_Grey,
  },
  totalCODContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 1,
  },
  totalCODTitle: {
    fontSize: 14,
    color: Constants.Dark_Grey,
    paddingRight: 8,
  },
  totalCODText: {
    color: Constants.THEME_COLOR,
    fontSize: 14,
  },
  arrowButtonContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
  },
  arrowButton: {
    bottom: 0,
  },
  tncBackground: {
    backgroundColor: 'transparent',
  },
  tncText: {
    alignSelf: 'center',
    color: Constants.Dark_Grey,
    fontSize: 16,
  },
  tncTextWithLinkContainer: {
    alignSelf: 'center',
  },
  tncTextWithLink: {
    color: Constants.THEME_COLOR,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  rowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tncContainer: {
    flex: 1,
    backgroundColor: Constants.WHITE,
  },
  clearButtonContainer: {
    flex: 1,
    backgroundColor: Constants.Light_Grey,
    padding: 24,
  },
  nextButtonContainer: {
    flex: 1,
    backgroundColor: Constants.Completed_Color,
    padding: 24,
  },
  disableNextButtonContainer: {
    flex: 1,
    backgroundColor: Constants.Disable_Color,
    padding: 24,
  },
  cleaButton: {
    fontSize: 24,
    fontFamily: Constants.NoboSansBoldFont,
    color: '#000000',
  },
  nextButton: {
    fontSize: 24,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.WHITE,
  },
  icon: {
    margin: 6,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNumberContainer: {
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  orderNumber: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
  },
  signatureLineContainer: {
    alignItems: 'center',
  },
  dotLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Ensures full width
  },
  dot: {
    width: 2,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 5 / 2, // Makes it a circle
    marginHorizontal: 5 / 2, // Ensures spacing is even
  },
});
