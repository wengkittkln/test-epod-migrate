import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  View,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import {usePhotoHorizontalFlatList} from './usePhotoHorizontalFlatList';
import AddPhoto from '../../Assets/image/icon_addimage.png';
import PhotoItem from './PhotoItem';

const PhotoHorizontalFlatList = ({
  itemOnPressed = () => {},
  addPhotoOnPressed = () => {},
  disabled = false,
  flatlistBackgroundColor = '#E1E1E1',
  width,
  height,
  isExportPhoto = false,
}) => {
  const {cameraModel, selectedItem, setSelectedItem} =
    usePhotoHorizontalFlatList();
  const [photos, setPhotos] = useState(null);
  //-------------- photo view ---------------
  const renderPhotoItem = ({item}) => {
    let backgroundColor = Constants.WHITE;
    let isSelected = false;
    if (selectedItem && item.uuid === selectedItem.uuid) {
      backgroundColor = '#6e3b6e';
      isSelected = true;
    }
    return (
      <PhotoItem
        item={item}
        onPress={() => {
          setSelectedItem(item);
          itemOnPressed(item);
        }}
        style={[styles.photoItem]}
        isSelected={isSelected}
      />
    );
  };

  const renderViewOnlyPhotoItem = ({item}) => {
    let backgroundColor = Constants.WHITE;
    let isSelected = false;
    if (selectedItem && item.uuid === selectedItem.uuid) {
      backgroundColor = '#6e3b6e';
      isSelected = true;
    }
    return (
      <PhotoItem
        item={item}
        onPress={() => {
          setSelectedItem(item);
        }}
        style={[styles.photoItem]}
        isSelected={false}
      />
    );
  };

  // const Item = ({item, onPress, style}) => (
  //   <TouchableOpacity
  //     disabled={disabled}
  //     onPress={onPress}
  //     style={[styles.item, style]}>
  //     <Image
  //       style={styles.imageItem}
  //       source={{
  //         uri: item.file,
  //       }}
  //       resizeMode="contain"
  //     />
  //   </TouchableOpacity>
  // );
  //-------------- photo view ---------------

  //-------------- add photo view ---------------

  const renderAddPhotoFooter = () => {
    return (
      <TouchableOpacity onPress={addPhotoOnPressed} style={styles.addPhoto}>
        <Image
          style={styles.imageItem}
          source={AddPhoto}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyView = () => {
    return <View />;
  };

  //-------------- add photo view ---------------

  const PhotoList = React.memo(() => (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      style={[
        styles.flatlist,
        {backgroundColor: flatlistBackgroundColor, width, height},
      ]}
      data={cameraModel.photos}
      renderItem={renderPhotoItem}
      ListFooterComponent={
        isExportPhoto ? renderEmptyView : renderAddPhotoFooter
      }
      extraData={photos}
      horizontal={true}
      windowSize={1}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      initialNumToRender={8}
    />
  ));

  useEffect(() => {
    setTimeout(() => {
      setPhotos(cameraModel.photos);
      console.log('SET PHOTOSSSSSSS ');
    }, 500);
  }, []);

  return <PhotoList />;
};

const styles = StyleSheet.create({
  imageItem: {
    height: '100%',
    aspectRatio: 1 / 1,
  },
  imageItemContainer: {
    margin: 8,
  },
  flatlist: {
    flex: 1,
    paddingLeft: 16,
    backgroundColor: '#E1E1E1',
  },
  addPhoto: {
    marginTop: 8,
    marginBottom: 8,
    marginRight: 16,
  },
  photoItem: {
    marginTop: 8,
    marginBottom: 8,
    marginRight: 16,
  },
});

const isEqual = () => {
  return true;
};

export default PhotoHorizontalFlatList;
