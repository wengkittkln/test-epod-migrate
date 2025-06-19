import React, {useLayoutEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {useJobTransferJobList} from '../../Hooks/JobTransfer/useJobTransferJobList';
import {JobTransferJobListProps} from '../../NavigationStacks/JobTransferStack';
import * as Constants from '../../CommonConfig/Constants';
import store from '../../Reducers';
import {Language} from '../../Model/Langauge';
import {ImageRes} from '../../Assets';
import {JobItemList} from '../../Model/JobTransfer';
import {translationString} from './../../Assets/translation/Translation';

export const JobTransferJobListScreen = ({
  route,
  navigation,
}: JobTransferJobListProps): JSX.Element => {
  const {
    datalist,
    selectJob,
    deleteSelectedJob,
    getSelectedCount,
    confirmSelection,
    scanqr,
  } = useJobTransferJobList(route, navigation);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () => (
        <View style={styles.optionMenu}>
          <TouchableOpacity style={styles.menuIcon} onPress={() => scanqr()}>
            <Image source={ImageRes.ScanIcon} />
          </TouchableOpacity>
        </View>
      ),
      headerTitle: translationString.job_transfers.request_select_job,
    });
  }, [navigation]);

  const languageModel = useSelector<typeof store>(
    (state) => state.LanguageReducer,
  ) as Language;

  const jobItems = (item: JobItemList) => {
    return (
      <View>
        {item.isSelected && (
          <View style={styles.selectedContainer}>
            <TouchableOpacity
              onPress={() => {
                item.isSelected = false;
                deleteSelectedJob(item.id!, item.trackingList);
              }}>
              <Text style={styles.cancelBtn}>
                {translationString.cancel_btn}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            item.isSelected = selectJob(item);
          }}
          style={styles.baseJobItemContainer}>
          <View style={[styles.container, {flex: 1.2}]}>
            <View style={styles.trackingContainer}>
              <Text style={styles.trackingLabel}>{item.trackingList}</Text>
              <Text style={styles.recipientLabel}>
                {translationString.job_transfers.recipient} {item.isSelected}
              </Text>
            </View>
            <View style={styles.statusIconContainer}>
              {item.codAmount != undefined && item.codAmount > 0 && (
                <Image style={styles.statusIcon} source={ImageRes.CashIcon} />
              )}
              {item.jobType === Constants.JobType.DELIVERY && (
                <Image
                  style={styles.statusIcon}
                  source={
                    languageModel.code !== 'zh-Hants'
                      ? ImageRes.DeliverEnglishIcon
                      : ImageRes.DeliverIcon
                  }
                />
              )}
              {item.jobType === Constants.JobType.PICK_UP && (
                <Image
                  style={styles.statusIcon}
                  source={
                    languageModel.code !== 'zh-Hants'
                      ? ImageRes.PickUpEnglishIcon
                      : ImageRes.PickUpIcon
                  }
                />
              )}
            </View>
          </View>
          <View style={styles.horizotalLine}></View>
          <View style={[styles.container, {flex: 1.8}]}>
            <View style={styles.trackingContainer}>
              <Text numberOfLines={3} style={styles.addressLabel}>
                {item.destination}
              </Text>
            </View>
            <View style={styles.verticalLine}></View>
            <View style={styles.statusIconContainer}>
              <Text style={styles.quantityLabel}>{item.totalQuantity}</Text>
              <Text style={styles.pcsLabel}>
                {translationString.job_transfers.pcs}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.baseContainer}>
      <FlatList
        keyExtractor={(item) => item.id!.toString()}
        data={datalist}
        renderItem={({item}) => jobItems(item)}
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: Constants.Failed_Color},
          ]}
          onPress={() => {
            navigation.pop();
          }}>
          <Text style={styles.confirmText}>{translationString.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: Constants.Completed_Color},
          ]}
          onPress={() => confirmSelection()}>
          <Text style={styles.confirmText}>{getSelectedCount()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  baseJobItemContainer: {
    margin: 5,
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 5,
    width: '100%',
  },
  statusIconContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    display: 'flex',
    flex: 0.5,
    justifyContent: 'space-evenly',
  },
  trackingLabel: {
    fontFamily: Constants.fontFamily,
    fontSize: 20,
    flex: 1,
    alignSelf: 'stretch',
  },
  recipientLabel: {
    fontFamily: Constants.fontFamily,
    fontSize: 18,
    flex: 1,
    color: '#676767',
    alignSelf: 'stretch',
  },
  addressLabel: {
    fontFamily: Constants.fontFamily,
    fontSize: 24,
    flex: 1,
    color: 'black',
    alignSelf: 'stretch',
  },
  quantityLabel: {
    color: Constants.THEME_COLOR,
    fontFamily: Constants.fontFamily,
    fontSize: 25,
  },
  pcsLabel: {
    fontFamily: Constants.fontFamily,
    fontSize: 15,
    alignSelf: 'flex-end',
  },
  statusIcon: {},
  bottomContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
  selectedContainer: {
    position: 'absolute',
    borderRadius: 2,
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
    zIndex: 5,
    backgroundColor: '#00000070',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
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
  verticalLine: {
    height: '90%',
    width: 1,
    backgroundColor: '#00000029',
  },
  horizotalLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#00000029',
  },
  optionMenu: {
    flexDirection: 'row',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  menuIcon: {
    padding: 10,
  },
});
