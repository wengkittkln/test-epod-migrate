import React, {useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import {useReorder} from '../../../Hooks/JobList/Reorder/useReorder';
import * as Constants from '../../../CommonConfig/Constants';
import {translationString} from '../../../Assets/translation/Translation';
import ReorderJobItem from '../../../Components/Reorder/ReorderJobItem';
import Toast from 'react-native-easy-toast';
import ProgressBarLoadingModal from './../../../Components/ProgressBarLoadingModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import {CustomDialogView} from '../../../Components//General/CustomDialogView';

export default ({route, navigation}) => {
  const {
    ref,
    datalist,
    progress,
    isLoading,
    isShowConfirmDialog,
    routeName,
    confirmButtonOnPressed,
    dragEnd,
    setIsShowConfirmDialog,
  } = useReorder(route, navigation);

  const renderItem = useCallback(
    ({item, index, drag, isActive}: RenderItemParams<Item>) => {
      return (
        <ReorderJobItem
          item={item}
          onLongPress={drag}
          isActive={isActive}
          index={index}
          navigation={navigation}
          isPreSequence={routeName === 'PreRouteSequence'}
        />
      );
    },
    [],
  );

  let DraggableFlatListProps = {};

  if (Platform.OS === 'android') {
    DraggableFlatListProps.autoscrollSpeed = 10;
  }

  return (
    <View style={styles.baseContainer}>
      {routeName === 'PreRouteSequence' && (
        <FlatList
          containerStyle={styles.flatlist}
          data={datalist}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
        />
      )}
      {routeName !== 'PreRouteSequence' && (
        <DraggableFlatList
          containerStyle={styles.flatlist}
          data={datalist}
          renderItem={renderItem}
          dragItemOverflow
          keyExtractor={(item) => `draggable-item-${item.id}`}
          onDragEnd={({data, from, to}) => {
            dragEnd(from, to, data);
          }}
          {...DraggableFlatListProps}
        />
      )}
      {routeName !== 'PreRouteSequence' && (
        <View style={styles.horizontalContainer}>
          <TouchableOpacity
            onPress={() => {
              setIsShowConfirmDialog(true);
            }}
            activeOpacity={0.7}
            style={styles.touchableOpacityStyle}>
            <Icon
              name="check"
              backgroundColor="transparent"
              color="white"
              size={40}
            />
          </TouchableOpacity>
        </View>
      )}
      {/* <View style={styles.horizontalContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={cancelButtonOnPressed}>
          <>
            <Image style={styles.icon} source={CancelIcon} />
            <Text style={styles.cancelButtonText}>
              {translationString.cancel_btn}
            </Text>
          </>
        </TouchableOpacity>
        <TouchableOpacity
          underlayColor={Constants.Green_Underlay}
          style={styles.confirmButton}
          onPress={confirmButtonOnPressed}>
          <>
            <Image style={styles.icon} source={ConfirmIcon} />
            <Text style={styles.confirmButtonText}>
              {translationString.confirm}
            </Text>
          </>
        </TouchableOpacity>
      </View> */}

      <Toast style={{marginBottom: 16}} ref={ref} position={'bottom'} />
      <ProgressBarLoadingModal
        message={'Fetching Route Sequence'}
        isShowLoginModal={isLoading}
        progress={progress}
      />
      <CustomDialogView
        isError={false}
        description={translationString.confirm}
        isShow={isShowConfirmDialog}
        onLeftClick={() => {
          setIsShowConfirmDialog(false);
        }}
        onRightClick={() => {
          confirmButtonOnPressed();
          setIsShowConfirmDialog(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  touchableOpacityStyle: {
    backgroundColor: '#33c702',
    position: 'absolute',
    width: 70,
    height: 70,
    alignItems: 'center',
    borderRadius: 50,
    justifyContent: 'center',
    right: 20,
    bottom: 20,
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 70,
    height: 70,
    //backgroundColor:'black'
  },
  baseContainer: {
    flex: 1,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  flatlist: {
    flex: 1,
    margin: 6,
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
  icon: {
    margin: 6,
  },
});
