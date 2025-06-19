/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {translationString} from '../../../../Assets/translation/Translation';
import {useScannedItemList} from '../../../../Hooks/JobList/Action/ScanQr/useScannedItemList';
import * as Constants from '../../../../CommonConfig/Constants';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import DeleteIcon from '../../../../Assets/image/icon_close.png';


export default ({route, navigation}) => {
  const {deleteItem, confirmScannedList, scannedList} = useScannedItemList(
    route,
    navigation,
  );

  return (
    <SafeAreaView>
      <FlatList
        data={scannedList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) => (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(206,206,206,1)',
            }}>
            <Text
              style={{
                flex: 10,
                fontSize: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 10,
              }}>
              {item.qrCode}
            </Text>
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => deleteItem(item.id)}>
              <Image source={DeleteIcon} />
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.cencelButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Text style={styles.confirmText}>{translationString.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => confirmScannedList()}>
          <Text style={styles.confirmText}>
            {translationString.premission_ok_btn}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    backgroundColor: 'rgb(220,220,220)',
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.NoboSansBoldFont,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 50,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    flex: 1,
  },
  cencelButton: {
    backgroundColor: Constants.Failed_Color,
    justifyContent: 'center',
    flex: 1,
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
});
