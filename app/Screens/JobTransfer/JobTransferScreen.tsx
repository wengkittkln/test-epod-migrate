import React, {useLayoutEffect} from 'react';
import {JobTransferProps} from '../../NavigationStacks/JobTransferStack';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  useWindowDimensions,
} from 'react-native';
import {useJobTransfer} from './../../Hooks/JobTransfer/useJobTransfer';
// import Toast from 'react-native-easy-toast';
import {ImageRes} from '../../Assets';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from './../../Assets/translation/Translation';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {JobTransfer} from './../../Model/DatabaseModel/JobTransfer';
import LoadingModal from '../../Components/LoadingModal';

export const JobTransferScreen = ({route, navigation}: JobTransferProps) => {
  const {
    requestedList,
    acceptedList,
    routes,
    index,
    isLoading,
    addRequest,
    setIndex,
    formatDate,
    getJobCount,
    getStatusColor,
    toDetail,
  } = useJobTransfer(route, navigation);
  // let {qrRef} = useJobTransfer(navigation);
  const layout = useWindowDimensions();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.pop();
          }}>
          <Image source={ImageRes.BackButton} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.optionMenu}>
          <TouchableOpacity
            style={styles.menuIcon}
            onPress={() => addRequest()}>
            <Image source={ImageRes.AddIcon} />
          </TouchableOpacity>
        </View>
      ),
      headerTitle: translationString.job_transfers.job_transfer_list,
    });
  }, [navigation]);

  const getStatusText = (status?: number): string => {
    switch (status) {
      case 0:
        return translationString.job_transfers.pending;
      case 1:
        return translationString.job_transfers.cancelled;
      case 2:
        return translationString.job_transfers.rejected;
      case 3:
        return translationString.job_transfers.completed;
      default:
        return '';
    }
  };

  const renderAcceptedList = () => {
    return (
      <SafeAreaView>
        <FlatList
          keyExtractor={(item) => item.id!.toString()}
          data={acceptedList}
          renderItem={({item}) => transferListItem(item, false)}
        />
        {/* {actionDialog()} */}
      </SafeAreaView>
    );
  };

  const renderReceiveList = () => {
    return (
      <SafeAreaView>
        <FlatList
          keyExtractor={(item) => item.id!.toString()}
          data={requestedList}
          renderItem={({item}) => transferListItem(item, true)}
        />
        {/* TODO translate*/}
        <LoadingModal isShowLoginModal={isLoading} message={'Data Fetching'} />
      </SafeAreaView>
    );
  };

  const transferListItem = (item: JobTransfer, isShowStatus: boolean) => {
    return (
      <View style={styles.baseTransferItemContainer}>
        <TouchableOpacity onPress={() => toDetail(item)}>
          <View
            style={[
              styles.container,
              {
                height: 23,
                padding: 0,
                flex: 1.8,
                flexDirection: 'column',
                backgroundColor: getStatusColor(item.status),
              },
            ]}>
            <Text
              style={{
                paddingTop: 2,
                fontSize: 12,
                color: 'white',
                marginBottom: 5,
              }}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <View
            style={[styles.container, {flex: 1.8, flexDirection: 'column'}]}>
            <View style={{padding: 5}}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                }}>
                <Text style={[styles.topContent, styles.title]}>
                  {translationString.job_transfers.received_from}
                </Text>
                <Text style={[styles.topContent, styles.title]}>
                  {translationString.job_transfers.lastUpdated}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                }}>
                <Text style={[styles.topContent, styles.highlightedValue]}>
                  {item.createdByName}
                </Text>
                <Text style={[styles.topContent, {fontSize: 18}]}>
                  {formatDate(item.createdDate)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.horizotalLine}></View>

          <View style={[styles.container, {flex: 1.2, flexDirection: 'row'}]}>
            <View
              style={{
                flex: 0.5,
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <Text style={styles.title}>
                {!isShowStatus
                  ? translationString.job_transfers.job_accepted
                  : translationString.job_transfers.job_transferred}
              </Text>
              <Text style={styles.highlightedValue}>{getJobCount(item)}</Text>
            </View>
            <View style={styles.verticalLine}></View>
            <View
              style={{
                flex: 0.5,
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <Text style={styles.title}>
                {!isShowStatus
                  ? translationString.job_transfers.parcel_accepted
                  : translationString.job_transfers.parcel_transferred}
              </Text>
              <Text style={styles.highlightedValue}>
                {item.transferedParcelQuantity}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderScene = SceneMap({
    accepted: renderAcceptedList,
    requested: renderReceiveList,
  });

  return (
    <TabView
      style={styles.tabContent}
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      renderTabBar={(props) => (
        <TabBar {...props} style={{backgroundColor: Constants.THEME_COLOR}} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    backgroundColor: '#ebe8e8',
  },
  qr: {
    padding: 20,
    alignItems: 'center',
  },
  dialogBodyContainer: {
    paddingTop: 30,
  },
  dialogHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    // backgroundColor: Constants.THEME_COLOR,
    fontFamily: Constants.fontFamily,
  },
  dialogButtonContainer: {
    marginTop: 30,
    height: 60,
    justifyContent: 'center',
  },
  dialogButton: {
    fontFamily: Constants.fontFamily,
    fontSize: 25,
    color: Constants.THEME_COLOR,
    alignSelf: 'stretch',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    display: 'flex',
  },
  actionButtonOuterContainer: {
    borderRadius: 10,
    margin: 10,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: Constants.THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 2,
  },
  actionIcon: {
    height: 80,
    width: 80,
    marginRight: 5,
    marginLeft: 5,
  },
  actionButtonText: {
    textAlign: 'center',
    fontFamily: Constants.fontFamily,
    fontSize: 18,
    color: '#000',
    flex: 1,
    flexWrap: 'wrap',
  },
  optionMenu: {
    flexDirection: 'row',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  menuIcon: {
    padding: 10,
  },
  tabContent: {
    // padding: 10,
  },
  baseTransferItemContainer: {
    marginRight: 10,
    marginLeft: 10,
    marginTop: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.8,
  },
  container: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContent: {
    flex: 0.5,
    marginBottom: 5,
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
  title: {
    fontWeight: '700',
    color: '#8d8d8d',
    fontSize: 16,
  },
  highlightedValue: {
    color: Constants.THEME_COLOR,
    fontSize: 25,
  },
});
