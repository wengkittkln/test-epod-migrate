import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Modal,
} from 'react-native';
import {useEsignConfirm} from '../../../../Hooks/JobList/Action/Esign/useEsignConfirm';
import PrompGreyIcon from '../../../../Assets/image/icon_promp_grey.png';
import {translationString} from '../../../../Assets/translation/Translation';
import * as Constants from '../../../../CommonConfig/Constants';
import ButtonConfirm from '../../../../Assets/image/icon_continue_big.png';
import OrderItemsModel from '../../../../Components/OrderItem/OrderItemsModel';
import LoadingModal from '../../../../Components/LoadingModal';
import {useSelector} from 'react-redux';

export default ({route, navigation}) => {
  const {
    getQuantityText,
    getTotalCODText,
    viewOrderItem,
    closeDialog,
    submitEsignPhoto,
    orderList,
    orderItemList,
    isModalVisible,
    isShowLoadingIndicator,
  } = useEsignConfirm(route, navigation);
  const job = route.params.job;
  const currentBase64Photo = route.params.actionAttachment.filePath;
  const userModel = useSelector((state) => state.UserReducer);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  return (
    <View
      style={styles.baseContainer}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setHeight(height);
        setWidth(width);
      }}>
      <View style={[styles.topContainer, {width, height: height * 0.1}]}>
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
      <View
        style={{
          width,
          height: height * 0.7,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          style={[
            styles.previewContainer,
            {
              width: width * 0.9,
              height: height * 0.6,
              marginHorizontal: width * 0.05,
            },
          ]}
          source={{
            uri: currentBase64Photo,
          }}
          resizeMode="stretch"
        />
      </View>

      <TouchableOpacity
        underlayColor={Constants.Green_Underlay}
        style={[styles.confirmButtonContainer, {width, height: height * 0.2}]}
        onPress={submitEsignPhoto}
        disabled={isShowLoadingIndicator}>
        <View style={styles.button}>
          <Image style={styles.icon} source={ButtonConfirm} />
          <Text style={styles.nextButton}>{translationString.confirm}</Text>
        </View>
      </TouchableOpacity>

      <LoadingModal
        isShowLoginModal={isShowLoadingIndicator}
        message={translationString.loading2}
      />
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
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
  arrowButtonContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
  },
  arrowButton: {
    bottom: 0,
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
  previewContainer: {
    backgroundColor: Constants.WHITE,
  },
  confirmButtonContainer: {
    backgroundColor: Constants.Completed_Color,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    margin: 6,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    fontSize: 24,
    fontFamily: Constants.NoboSansBoldFont,
    color: Constants.WHITE,
  },
});
