import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import DeliverIcon from '../../Assets/image/icon_deliver_small.png';
import DeliverEnglishIcon from '../../Assets/image/icon_deliver_orange.png';
import PickUpIcon from '../../Assets/image/icon_pickup_small.png';
import PickUpEnglishIcon from '../../Assets/image/icon_collect_grey.png';
import SortingIcon from '../../Assets/image/icon_sorting.png';
import {useReorderJobItem} from './useReorderJobItem';
import {useSelector, useDispatch} from 'react-redux';

const ReorderJobItem = ({
  item,
  onLongPress,
  isActive,
  index,
  isDisabled,
  isPreSequence,
  navigation,
}) => {
  const languageModel = useSelector((state) => state.LanguageReducer);
  const {
    statusBarColour,
    getConsignee,
    getConsigneeTitleWithColon,
    navigateToRouteSequence,
  } = useReorderJobItem(item, navigation, isPreSequence);

  const getBackgroundColor = () => {
    let colorCode = '';

    if (isPreSequence && (!item.latitude || !item.longitude)) {
      colorCode = '#e6e6e6';
    } else {
      colorCode = 'transparent';
    }
    return colorCode;
  };

  return (
    <View>
      <TouchableOpacity
        disabled={isPreSequence && (!item.latitude || !item.longitude)}
        style={[
          styles.sortIconContainer,
          {backgroundColor: isActive ? '#0000000D' : 'transparent'},
        ]}
        onLongPress={onLongPress}
        onPress={() => navigateToRouteSequence(item)}>
        <View style={styles.baseContainer}>
          <View
            style={[
              styles.statusContainer,
              {backgroundColor: statusBarColour(item.status)},
            ]}>
            <Text style={{fontWeight: 'bold'}}>
              {!item.sequence ? '_' : item.sequence}
            </Text>
          </View>

          <View
            style={[styles.container, {backgroundColor: getBackgroundColor()}]}>
            <View style={styles.receiverContainer}>
              <Text style={styles.receiverLabel}>
                {getConsigneeTitleWithColon()}{' '}
              </Text>
              <Text style={styles.receiverName}>{getConsignee()}</Text>

              <View style={styles.horizontalContainer}>
                {item.jobType === Constants.JobType.DELIVERY && (
                  <Image
                    style={styles.smallIcon}
                    source={
                      languageModel.code !== 'zh-Hants'
                        ? DeliverEnglishIcon
                        : DeliverIcon
                    }
                  />
                )}
                {item.jobType === Constants.JobType.PICK_UP && (
                  <Image
                    style={styles.smallIcon}
                    source={
                      languageModel.code !== 'zh-Hants'
                        ? PickUpEnglishIcon
                        : PickUpIcon
                    }
                  />
                )}
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.receiverContainer}>
              {/* just use to set spacing */}
              {/* <Text style={{color: 'transparent'}}>
              {getConsigneeTitleWithColon()}
            </Text> */}
              <View style={{flex: 1}}>
                {/* TODO remove when production */}
                <Text style={styles.receiverName}>Job ID {item.id}</Text>
                <Text style={styles.address}>{item.destination}</Text>
              </View>
              <View style={{justifyContent: 'center'}}>
                {!isPreSequence && (
                  <Image style={styles.sortIcon} source={SortingIcon} />
                )}
              </View>
            </View>
          </View>

          {/* <View style={styles.verticalDivider} /> */}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseContainer: {
    flex: 1,
    marginHorizontal: 2,
    marginVertical: 2,
    flexDirection: 'row',
    borderRadius: 2,
    elevation: 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 9,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
  },
  receiverContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiverLabel: {
    color: '#A0A0A0',
    fontSize: 18,
  },
  receiverName: {
    flex: 1,
    marginLeft: 4,
    color: '#A0A0A0',
    fontSize: 18,
  },
  sortIconContainer: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIcon: {
    margin: 8,
  },
  smallIcon: {
    marginLeft: 8,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  verticalDivider: {
    backgroundColor: '#00000029',
    width: 1,
  },
  address: {
    flex: 1,
    marginTop: 8,
    marginBottom: 16,
    color: Constants.Dark_Grey,
    fontSize: 20,
  },
});

export default ReorderJobItem;
