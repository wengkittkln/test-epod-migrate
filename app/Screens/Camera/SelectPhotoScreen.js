import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import AddPhoto from '../../Assets/image/icon_addimage.png';
import {useSelectPhoto} from '../../Hooks/Camera/useSelectPhoto';
import Modal from 'react-native-modal';
import {translationString} from '../../Assets/translation/Translation';
import ImageViewer from 'react-native-image-zoom-viewer';
import PhotoHorizontalFlatList from '../../Components/PhotoHorizontalFlatList/PhotoHorizontalFlatList';
import LoadingModal from './../../Components/LoadingModal';

import {useSelector} from 'react-redux';

export default ({route, navigation}) => {
  const {
    onPressPhoto,
    addPhoto,
    deletePhoto,
    showHideDialog,
    takePhotoFromCamera,
    getPhotoFromGallery,
    submitPhoto,
    exportToGallery,
    isModalVisible,
    photoPreview,
    selectedItem,
    cameraModel,
    isExportPhoto,
    isLoading,
  } = useSelectPhoto(route, navigation);
  const userModel = useSelector((state) => state.UserReducer);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const images = [
    {
      url: photoPreview,
      freeHeight: true,
    },
  ];

  return (
    <SafeAreaView
      style={styles.baseContainer}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}>
      <View
        style={[
          styles.imagePreviewContainer,
          {
            width,
            height: height * 0.75,
          },
        ]}>
        {photoPreview && (
          <ImageViewer
            style={[styles.imagePreview, {height: height * 0.65}]}
            backgroundColor={Constants.WHITE}
            imageUrls={images}
            resizeMode="contain"
            // to remove indicator
            renderIndicator={(index) => {
              null;
            }}
          />
        )}

        {!isExportPhoto && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              {height: height * 0.05, marginVertical: height * 0.02},
            ]}
            onPress={deletePhoto}>
            <Text style={styles.deleteButtonText}>
              {translationString.select_photo_delete}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <PhotoHorizontalFlatList
        itemOnPressed={onPressPhoto}
        addPhotoOnPressed={isExportPhoto ? () => {} : addPhoto}
        width={width}
        height={height * 0.2}
        isExportPhoto={isExportPhoto}
      />
      {!isExportPhoto && (
        <TouchableOpacity
          onPress={submitPhoto}
          style={[
            styles.submitButtonContainer,
            {width, height: height * 0.08},
          ]}>
          <Text style={[styles.submitButton]}>{translationString.submit}</Text>
        </TouchableOpacity>
      )}
      {isExportPhoto && (
        <TouchableOpacity
          onPress={exportToGallery}
          style={[
            styles.submitButtonContainer,
            {width, height: height * 0.08},
          ]}>
          <Text style={[styles.submitButton]}>
            {translationString.export_label}
          </Text>
        </TouchableOpacity>
      )}
      <View>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modelView}>
            <Text style={styles.modelTitle}>
              {translationString.select_photo}
            </Text>
            <TouchableOpacity onPress={takePhotoFromCamera}>
              <Text style={styles.modelText}>
                {translationString.dialog_pick_camera}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={getPhotoFromGallery}>
              <Text style={styles.modelText}>
                {translationString.dialog_pick_gallery}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modelButtonContainer}
              onPress={() => showHideDialog(false)}>
              <Text style={styles.modelButton}>
                {translationString.cancel.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading2}
      />
    </SafeAreaView>
  );
};
//-------------- add photo view ---------------

const styles = StyleSheet.create({
  baseContainer: {
    backgroundColor: Constants.WHITE,
    flex: 1,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: Constants.screenWidth,
  },
  imagePreview: {
    width: Constants.screenWidth,
  },
  deleteButton: {
    alignSelf: 'center',
    justifyContent: 'flex-end',
    borderRadius: 4,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Constants.THEME_COLOR,
  },
  deleteButtonText: {
    color: Constants.WHITE,
    fontSize: Constants.buttonFontSize,
    fontFamily: Constants.fontFamily,
  },
  imageItem: {
    height: '100%',
    aspectRatio: 1 / 1,
  },
  imageItemContainer: {
    margin: 8,
  },
  flatlist: {
    flex: 1,
    width: Constants.screenWidth,
    paddingLeft: 16,
    backgroundColor: '#E1E1E1',
  },
  submitButtonContainer: {
    backgroundColor: Constants.Completed_Color,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  submitButton: {
    color: Constants.WHITE,
    fontSize: Constants.buttonFontSize,
  },
  modelView: {
    minWidth: 300,
    backgroundColor: Constants.WHITE,
    alignSelf: 'center',
    borderRadius: 4,
  },
  modelTitle: {
    fontSize: 18,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  modelText: {
    fontSize: Constants.textInputFonSize,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  modelButtonContainer: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  modelButton: {
    fontSize: Constants.buttonFontSize,
    color: Constants.THEME_COLOR,
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
