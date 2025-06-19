import React from 'react';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import * as Constants from '../../../../CommonConfig/Constants';
import {translationString} from '../../../../Assets/translation/Translation';
import {useScanSkuItem} from '../../../../Hooks/JobList/Action/ScanQr/useScanSkuItem';
import ContinueIcon from '../../../../Assets/image/icon_continue.png';
import DeleteIcon from '../../../../Assets/image/icon_wrongnumber.png';
import SkuItem from '../../../../Components/SkuItem/SkuItem';

export default ({route, navigation}) => {
  const {
    scannedOrderItems,
    continueButtonOnPressed,
    disabledContinue,
    emptyItemDisplay,
    deleteScannedItem,
    orderItems,
    isPD,
  } = useScanSkuItem(route, navigation);
  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatlist}
        data={scannedOrderItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <SkuItem
            item={item}
            onDelete={(item) => {
              deleteScannedItem(item);
            }}
            isPD={isPD}
            index={item.id.toString()}
          />
        )}
      />
      <Text
        style={[
          styles.noData,
          {
            display: emptyItemDisplay ? 'none' : 'flex',
          },
        ]}>
        {translationString.empty_sku}
      </Text>
      <TouchableHighlight
        underlayColor={Constants.Green_Underlay}
        disabled={disabledContinue}
        onPress={continueButtonOnPressed}
        style={[
          styles.confirmButton,
          {
            backgroundColor: disabledContinue
              ? Constants.Pending_Color
              : Constants.Completed_Color,
          },
        ]}>
        <View style={styles.button}>
          <Image style={styles.buttonIcon} source={ContinueIcon} />
          <Text style={styles.confirmButtonText}>
            {translationString.completed}
          </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // backgroundColor: Constants.Completed_Color,
  },
  confirmButtonText: {
    fontSize: 24,
    color: 'white',
  },
  buttonIcon: {
    margin: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  noData: {
    flex: 1,
    fontFamily: Constants.NoboSansFont,
    fontSize: Constants.buttonFontSize,
    color: Constants.Dark_Grey,
    width: Constants.screenWidth,
    textAlign: 'center',
  },
  flatlist: {
    flex: 1,
  },
});
