import React, {useLayoutEffect} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {ImageRes} from '../../Assets';
import * as Constants from '../../CommonConfig/Constants';
import EmptyJobListView from '../../Components/EmptyJobListView';
import {MarketPlaceItem} from '../../Components/MarketPlace/MarketItem';
import {useMarketPlaceSearch} from '../../Hooks/MarketPlaces/useMarketPlaceSearch';
import {translationString} from '../../Assets/translation/Translation';
import {MarketPlaceListProps} from '../../NavigationStacks/MarketPlaceStack';

export const MarketPlacesSearchScreen = ({
  navigation,
}: MarketPlaceListProps) => {
  const {
    list,
    isRefresh,
    onRefresh,
    onLoadMore,
    isShowFooter,
    addSelected,
    removeSelected,
    getSelectedCount,
    setSearchText,
  } = useMarketPlaceSearch();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerBar}>
          <Image style={styles.searchIconTint} source={ImageRes.SearchIcon} />
          <TextInput
            style={styles.searchInput}
            onChangeText={(text) => setSearchText(text)}
            placeholder={translationString.search}
            autoCapitalize={'none'}
          />
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.pop();
          }}>
          <Image source={ImageRes.BackButton} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.baseContainer}>
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
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          navigation.navigate('MarketPlaceConfirmList');
        }}>
        <Text style={styles.confirmText}>{getSelectedCount()}</Text>
      </TouchableOpacity>
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
  optionMenu: {
    flexDirection: 'row',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  menuIcon: {
    padding: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 16,
    color: 'white',
    fontSize: Constants.textInputFonSize,
    fontFamily: Constants.fontFamily,
  },
  searchIconTint: {
    tintColor: 'white',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
