import React, {useLayoutEffect} from 'react';
import {
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  Modal,
  Pressable,
  SafeAreaView,
} from 'react-native';
import EmptyJobListView from '../../Components/EmptyJobListView';
import {useMarketPlace} from '../../Hooks/MarketPlaces/useMarketPlace';
import {MarketPlaceItem} from '../../Components/MarketPlace/MarketItem';
import {ImageRes} from '../../Assets';
import * as Constants from '../../CommonConfig/Constants';
import {MarketPlaceProps} from '../../NavigationStacks/MarketPlaceStack';
import {translationString} from '../../Assets/translation/Translation';
import {useMarketPlaceProvider} from '../../Provider/MarketPlaceProvider';
import {CustomDialogView} from '../../Components/General/CustomDialogView';

export const MarketPlaceScreen = ({route, navigation}: MarketPlaceProps) => {
  const {
    isLoading,
    list,
    isRefresh,
    onRefresh,
    onLoadMore,
    isShowFooter,
    addSelected,
    removeSelected,
    getSelectedCount,
    isShowQuitDialog,
    setShowQuitDialog,
    setLoading,
    isShowError,
    errorMessage,
    setShowError,
  } = useMarketPlace(navigation);

  const marketProvider = useMarketPlaceProvider();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            setShowQuitDialog(true);
          }}>
          <Image source={ImageRes.BackButton} />
        </TouchableOpacity>
      ),
      headerRight: () => menuOptions(),
      headerTitle: translationString.market_place_title,
    });
  }, [navigation]);

  const menuOptions = () => {
    return (
      <View style={styles.optionMenu}>
        <Pressable
          style={styles.menuIcon}
          onPress={() => navigation.navigate('MarketPlaceSearch')}>
          <Image source={ImageRes.SearchIcon} />
        </Pressable>
        <Pressable
          style={styles.menuIcon}
          onPress={() => navigation.navigate('MarketPlaceScan')}>
          <Image source={ImageRes.ScanIcon} />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.baseContainer]}>
      <CustomDialogView
        onRightClick={() => setShowError(false)}
        isError={true}
        description={errorMessage}
        isShow={isShowError}
      />
      {/* 
      Loading below get trigger when list update from MarketPlaceConfirmListScreen
      This trigger is to force FlatList to trigger update.
       */}
      <Modal
        onShow={() => {
          setLoading(false);
        }}
        visible={isLoading}
        transparent={true}
        animationType="none">
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Constants.THEME_COLOR} />
        </View>
      </Modal>

      <CustomDialogView
        isError={false}
        description={translationString.exit_confirm}
        isShow={isShowQuitDialog}
        onLeftClick={() => {
          setShowQuitDialog(false);
        }}
        onRightClick={() => {
          setShowQuitDialog(false);
          marketProvider.resetSelectedJobList();
          navigation.pop();
        }}
      />
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={onRefresh}
            tintColor={Constants.THEME_COLOR}
            colors={[Constants.THEME_COLOR]}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={1}
        ListFooterComponent={() => {
          return isShowFooter ? (
            <ActivityIndicator color={Constants.THEME_COLOR} />
          ) : null;
        }}
        contentContainerStyle={list.length === 0 && styles.centerEmptySet}
        style={styles.flatlist}
        data={list}
        keyExtractor={(item) => item.id.toString()}
        extraData={marketProvider.selectedJobList.length}
        renderItem={({item}) => (
          <MarketPlaceItem
            data={item}
            onDeselected={(job) => {
              removeSelected(job);
            }}
            onSelected={(job) => {
              addSelected(job);
            }}
          />
        )}
        ListEmptyComponent={() => <EmptyJobListView message={''} />}
      />
      <Pressable
        style={styles.confirmButton}
        onPress={() => {
          navigation.navigate('MarketPlaceConfirmList');
        }}>
        <Text style={styles.confirmText}>{getSelectedCount()}</Text>
      </Pressable>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  flatlist: {
    flex: 1,
  },
  centerEmptySet: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  optionMenu: {
    flexDirection: 'row',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  menuIcon: {
    padding: 10,
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
  loading: {
    backgroundColor: '#FFFFFF4D',
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
  },
});
