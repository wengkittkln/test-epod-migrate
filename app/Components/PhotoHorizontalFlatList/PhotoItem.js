import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Button,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import {useSelector} from 'react-redux';

const PhotoItem = ({item, onPress, style, isSelected}) => {
  let backgroundColor = Constants.WHITE;
  const userModel = useSelector((state) => state.UserReducer);
  if (isSelected) backgroundColor = '#6e3b6e';
  console.log(userModel);
  return (
    <TouchableOpacity
      disabled={false}
      onPress={onPress}
      style={[style, {backgroundColor: backgroundColor}]}>
      <Image
        style={styles.imageItem}
        source={{
          uri: item.file,
          scale: 0.3,
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const areEqual = (prevProps, nextProps) => {
  // return prevProps.item.uuid === nextProps.item.uuid;
  return prevProps.isSelected === nextProps.isSelected;
};

const styles = StyleSheet.create({
  imageItem: {
    height: '100%',
    aspectRatio: 1 / 1,
  },
});

export default React.memo(PhotoItem, areEqual);
