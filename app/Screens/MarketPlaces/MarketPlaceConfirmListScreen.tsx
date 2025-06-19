import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import EmptyJobListView from '../../Components/EmptyJobListView';
import {ImageRes} from '../../Assets';
import * as Constants from '../../CommonConfig/Constants';
import {MarketPlaceListProps} from '../../NavigationStacks/MarketPlaceStack';
import {useMarketPlaceConfirmList} from '../../Hooks/MarketPlaces/useMarketPlaceConfirmList';
import {translationString} from '../../Assets/translation/Translation';
import {MarketPlaceConfirmItem} from '../../Components/MarketPlace/MarketConfirmItem';
import LoadingModal from '../../Components/LoadingModal';
import {CustomDialogView} from '../../Components/General/CustomDialogView';
import DropDownPicker from 'react-native-dropdown-picker';

export const MarketPlaceConfirmListScreen = (
  marketProps: MarketPlaceListProps,
) => {
  const {navigation} = marketProps;
  const {
    getSelectedList,
    removeSelected,
    getSelectedCount,
    onConfirmClick,
    isLoading,
    isShowError,
    errorMessage,
    setShowError,
    allGroupCode,
    getAllGroupCodeData,
    setAllGroupCode,
  } = useMarketPlaceConfirmList(navigation);

  useEffect(() => {
    getAllGroupCodeData();
  }, []);

  const [openGroupCodeDropDown, setOpenGroupCodeDropdown] = useState(false);
  const [selectedGroupCode, setSelectedGroupCode] = useState(null);

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
      headerTitle: translationString.market_place_title,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.baseContainer}>
      <CustomDialogView
        description={errorMessage}
        isShow={isShowError}
        isError={true}
        onRightClick={() => {
          setShowError(false);
        }}
      />
      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading}
      />
      <View style={{paddingHorizontal: 10, marginVertical: 10}}>
        <Text
          style={{
            fontSize: 15,
            color: Constants.THEME_COLOR,
            marginBottom: 5,
          }}>
          {translationString.group}
        </Text>
        <DropDownPicker
          textStyle={{
            fontSize: 15,
            color: Constants.THEME_COLOR,
          }}
          open={openGroupCodeDropDown}
          value={selectedGroupCode}
          items={allGroupCode}
          setOpen={setOpenGroupCodeDropdown}
          setValue={setSelectedGroupCode}
          setItems={setAllGroupCode}
          placeholder={translationString.chooseAGroup}
          searchable={true}
        />
      </View>
      <FlatList
        contentContainerStyle={
          getSelectedList().length === 0 && styles.centerEmptySet
        }
        style={[styles.flatlist, {zIndex: -1}]}
        keyExtractor={(item) => item.id.toString()}
        data={getSelectedList()}
        renderItem={({item, index}) => (
          <MarketPlaceConfirmItem
            data={item}
            onDeleteClick={(job) => {
              removeSelected(job);
            }}
            onClick={(job) => {
              navigation.navigate('MarketPlaceDetails', {
                job: job,
              });
            }}
          />
        )}
        ListEmptyComponent={() => <EmptyJobListView message={''} />}
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => {
            navigation.pop();
          }}>
          <Text style={styles.confirmText}>{translationString.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!selectedGroupCode || getSelectedList().length === 0 }
          style={
            !selectedGroupCode || getSelectedList().length === 0
              ? {...styles.confirmButton, backgroundColor: 'grey'}
              : styles.confirmButton
          }
          onPress={() => {
            if (selectedGroupCode) {
              onConfirmClick(selectedGroupCode as number);
            }
          }}>
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
  bottomContainer: {
    flexDirection: 'row',
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
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
