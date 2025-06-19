import React from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {useSelfAssignment} from '../../../Hooks/JobList/SelfAssignment/useSelfAssignment';
import SelfAssignmentItem from '../../../Components/SelfAssignment/SelfAssignmentItem';
import {translationString} from '../../../Assets/translation/Translation';
import * as Constants from '../../../CommonConfig/Constants';
import NextIcon from '../../../Assets/image/icon_continue_small.png';
import LoadingModal from '../../../Components/LoadingModal';
import CustomAlertView from '../../../Components/CustomAlertView';

export default ({route, navigation}) => {
  const {
    orderList,
    isShowLoadingIndicator,
    alertMsg,
    getJobByOrder,
    getTrackingNumberOrCount,
    getPeriod,
    getOrderItemsByOrder,
    cancelButtonOnPressed,
    confirmButtonOnPressed,
    getButtonText,
  } = useSelfAssignment(route, navigation);
  return (
    <SafeAreaView style={styles.baseContainer}>
      <FlatList
        contentContainerStyle={orderList.length === 0 && styles.centerEmptySet}
        style={styles.flatlist}
        data={orderList}
        renderItem={({item}) => (
          <SelfAssignmentItem
            orderModel={item}
            job={getJobByOrder(item)}
            trackNumModel={getTrackingNumberOrCount(item)}
            requestTime={getPeriod(item)}
            orderItemList={getOrderItemsByOrder(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <LoadingModal
        isShowLoginModal={isShowLoadingIndicator}
        message={translationString.loading2}
      />

      <View style={styles.horizontalContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={cancelButtonOnPressed}>
          <View>
            <Text style={styles.cancelButtonText}>
              {translationString.cancel_btn}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmButtonOnPressed}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image source={NextIcon} style={styles.nextIcon} />
            <Text style={styles.confirmButtonText}>{getButtonText()}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {alertMsg !== '' && <CustomAlertView alertMsg={alertMsg} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'rgb(248, 248, 248)',
  },
  flatlist: {
    flex: 1,
  },
  centerEmptySet: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  cancelButton: {
    width: Constants.screenWidth / 2,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Light_Grey,
  },
  cancelButtonText: {
    fontFamily: Constants.fontFamily,
    fontSize: 20,
    color: Constants.Dark_Grey,
    padding: 6,
  },
  confirmButton: {
    width: Constants.screenWidth / 2,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.Completed_Color,
  },
  confirmButtonText: {
    fontFamily: Constants.fontFamily,
    fontSize: 20,
    color: 'white',
    padding: 6,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  nextIcon: {
    marginRight: 8,
  },
});
