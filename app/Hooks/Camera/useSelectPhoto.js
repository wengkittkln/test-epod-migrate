import React, {useEffect, useState, useLayoutEffect, useCallback} from 'react';
import * as Constants from '../../CommonConfig/Constants';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';
import ImagePicker from 'react-native-image-crop-picker';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {IndexContext} from '../../Context/IndexContext';
import * as PhotoRealmManager from '../../Database/realmManager/PhotoRealmManager';
import * as ActionRealmManager from '../../Database/realmManager/ActionRealmManager';
import * as OrderRealmManager from '../../Database/realmManager/OrderRealmManager';
import * as RootNavigation from '../../rootNavigation';
import {TouchableOpacity, Image, Platform} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';
import BackButton from '../../Assets/image/icon_back_white.png';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as JobHelper from '../../Helper/JobHelper';
import * as ActionHelper from '../../Helper/ActionHelper';
import {getAllOrderItems} from '../../Helper/OrderHelper';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {ActionSyncContext} from '../../Context/ActionSyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import * as Toast from '../../Components/Toast/ToastMessage';
import {PODHelper} from '../../Helper/PODHelper';
import * as ConfigurationRealmManager from '../../Database/realmManager/ConfigurationRealmManager';

export const useSelectPhoto = (route, navigation) => {
  const job = route.params.job;
  // use to define photo taking flow else it is exception or normal photo take
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;
  const isExportPhoto = route.name === 'exportPhoto';
  const batchJob = route.params.batchJob;

  const needScanSku = route.params.needScanSku;
  const cameraModel = useSelector((state) => state.CameraReducer);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(null);
  const [actionModel, setActionModel] = useState(route.params.actionModel);
  const dispatch = useDispatch();
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const [isLoading, setIsLoading] = useState(false);
  const from = route.params.from;

  const {batchJobActionMapper} = PODHelper();

  const isSkipSummary = route.params?.isSkipSummary
    ? route.params?.isSkipSummary
    : false;

  let filterTimeout;

  useFocusEffect(
    React.useCallback(() => {
      console.log('job.status', job.status);
      let photosModel = [];

      if (isExportPhoto) {
        photosModel = PhotoRealmManager.getPhotoByJobIdExceptStatus(
          Constants.SyncStatus.PENDING_SELECT_PHOTO,
          job.id,
          epodRealm,
        );
      } else {
        photosModel = PhotoRealmManager.getAllPendingFileByAction(
          actionModel.guid,
          Constants.SyncStatus.PENDING_SELECT_PHOTO,
          epodRealm,
        );
      }

      let photoList = [];
      photosModel.map((item) => {
        let itemModel = GeneralHelper.convertRealmObjectToJSON(item);
        photoList.push(itemModel);
      });

      let payload = {photos: photoList};
      dispatch(createAction(ActionType.SET_PENDING_PHOTO, payload));

      if (photosModel.length > 0) {
        onPressPhoto(photosModel[0]);
      }
    }, []),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerTitle: isExportPhoto
        ? translationString.export_photo
        : translationString.select_photo_title,
      headerRight: null,
    });
  }, [navigation, isExportPhoto]);

  const onPressPhoto = useCallback((item) => {
    setPhotoPreview(item ? item.file : null);
    setSelectedItem(item);
  }, []);

  const showHideDialog = (visible) => {
    setModalVisible(visible);
  };

  const deletePhoto = () => {
    if (selectedItem) {
      try {
        let payload = {photo: selectedItem};
        dispatch(createAction(ActionType.DELETE_PENDING_PHOTO, payload));

        PhotoRealmManager.deletePhotoByUUID(selectedItem.uuid, epodRealm);

        let photosModel = PhotoRealmManager.getAllPendingFileByAction(
          actionModel.guid,
          Constants.SyncStatus.PENDING_SELECT_PHOTO,
          epodRealm,
        );

        onPressPhoto(photosModel[0]);
      } catch (error) {
        alert('delete photo error: ' + error);
      }
    }
  };

  const addPhoto = useCallback(() => {
    showHideDialog(true);
  }, []);

  const takePhotoFromCamera = () => {
    const screenName = photoTaking ? 'PhotoFlowCamera' : 'Camera';
    showHideDialog(false);
    RootNavigation.navigate(screenName);
  };

  const getPhotoFromGallery = () => {
    showHideDialog(false);
    const quality = getUploadImageQuality();
    // ios cannot show image picker after modal is closed
    setTimeout(() => {
      ImagePicker.openPicker({
        multiple: true,
        compressImageQuality: quality,
        maxFiles: 10,
        compressImageMaxWidth: 1920,
        compressImageMaxHeight: 1920,
      }).then((images) => {
        if (images.values != null) {
          let imageList = [];

          images.map((item) => {
            let model = {
              jobId: job.id,
              actionId: actionModel.guid,
              file: item.path,
              uuid: uuidv4(),
              syncStatus: Constants.SyncStatus.PENDING_SELECT_PHOTO,
              source: Constants.SourceType.PHOTO_GALLERY,
              createDate: moment().format(),
            };
            savePhotoToDb(model);
            imageList.push(model);
          });

          let payload = {photos: imageList};
          dispatch(createAction(ActionType.ADD_PENDING_PHOTO, payload));
        }
      });
    }, 500);
  };

  const savePhotoToDb = async (photoData) => {
    try {
      PhotoRealmManager.insertNewPhotoData(photoData, epodRealm);
    } catch (error) {
      alert('save photo error: ' + error);
    }
  };

  const submitPhoto = async () => {
    let isUpdatePhotoSyncStatusNeeded = false;
    const result = await PhotoRealmManager.getAllPendingFileByAction(
      actionModel.guid,
      Constants.SyncStatus.PENDING_SELECT_PHOTO,
      epodRealm,
    );
    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );
    let tempActionModel = actionModel;

    if (result && result.length > 0) {
      if (orderList && orderList.length > 0) {
        tempActionModel.orderId = orderList[0].id;
        setActionModel(tempActionModel);
      }
      const isExist = await ActionHelper.checkForExsitingAction(
        tempActionModel,
        epodRealm,
      );

      // 1)-  Simple POD: Job List -> Select Job -> Click Confirm ->
      // -> take photo (like existing, can take multiple, have the side scroll, confirm)->
      // -> add action -> job list
      if (photoTaking) {
        if (
          step.stepRemark !== undefined &&
          step.stepRemark &&
          step.stepRemark.length > 0 &&
          step.stepCode !== Constants.StepCode.PRE_CALL
        ) {
          navigation.navigate('RemarkScreen', {
            job: job,
            step: step,
            consigneeName: JobHelper.getConsignee(job, false),
            trackNumModel: JobHelper.getTrackingNumberOrCount(job),
            actionModel: actionModel,
            photoTaking: photoTaking,
            needScanSku: needScanSku,
            batchJob: batchJob,
          });
        } else {
          let selectedJob = getFilteredBatchJob();
          let codAmount = 0;

          if (selectedJob && selectedJob.length > 0) {
            selectedJob.map((x) => {
              codAmount += x.codAmount;
            });
          } else {
            codAmount = job.codAmount;
          }
          switch (actionModel.actionType) {
            case Constants.ActionType.PARTIAL_DLEIVER_FAIL:
              if (needScanSku) {
                const payload = {
                  orderItems: [],
                };
                dispatch(
                  createAction(ActionType.UPDATE_SKU_ORDER_ITEMS, payload),
                );
                navigation.navigate('ScanSku', {
                  job: job,
                  actionModel: actionModel,
                  photoTaking: photoTaking,
                  stepCode: step.stepCode,
                  orderList: orderList,
                  isPD: true,
                  isSkipSummary: isSkipSummary,
                });
              } else {
                navigation.navigate('PartialDeliveryAction', {
                  job: job,
                  stepCode: step.stepCode,
                  actionModel: actionModel,
                  photoTaking: photoTaking,
                  needScanSku: needScanSku,
                  isSkipSummary: isSkipSummary,
                });
              }

              break;

            case Constants.ActionType.COLLECT_SUCCESS:
              navigation.navigate('CollectAction', {
                job: job,
                stepCode: step.stepCode,
                consigneeName: JobHelper.getConsignee(job, false),
                trackNumModel: JobHelper.getTrackingNumberOrCount(job),
                actionModel: actionModel,
                photoTaking: photoTaking,
              });
              break;

            default:
              if (
                actionModel.actionType === Constants.ActionType.PRE_CALL_SUCCESS
              ) {
                navigation.navigate('PreCallAction', {
                  job: job,
                  stepCode: step.stepCode,
                  consigneeName: JobHelper.getConsignee(job, false),
                  actionModel: actionModel,
                  photoTaking: photoTaking,
                  batchJob: batchJob,
                });
              } else if (needScanSku) {
                const allOrderItems = getAllOrderItems(
                  epodRealm,
                  orderList,
                  job.id,
                );
                const allWithoutSku = allOrderItems.every((e) => !e.skuCode);
                if (allWithoutSku) {
                  const scannedOrderItemsWithScannedTime = allOrderItems.map(
                    (e) => {
                      return {
                        ...e,
                        scanSkuTime: moment().format(),
                      };
                    },
                  );
                  navigation.navigate('ScanSkuItems', {
                    orderItems: scannedOrderItemsWithScannedTime,
                    job: job,
                    actionModel: actionModel,
                    photoTaking: photoTaking,
                    stepCode: step.stepCode,
                    orderList: orderList,
                  });
                } else {
                  const payload = {
                    orderItems: [],
                  };
                  dispatch(
                    createAction(ActionType.UPDATE_SKU_ORDER_ITEMS, payload),
                  );
                  navigation.navigate('ScanSku', {
                    job: job,
                    actionModel: actionModel,
                    photoTaking: photoTaking,
                    stepCode: step.stepCode,
                    orderList: orderList,
                  });
                }
              } else if (codAmount > 0) {
                navigation.navigate('CodAction', {
                  job: job,
                  stepCode: step.stepCode,
                  orderList: orderList,
                  actionModel: actionModel,
                  photoTaking: photoTaking,
                  batchJob: selectedJob,
                });
              } else if (
                step &&
                (step.stepCode === Constants.StepCode.BARCODE_POD ||
                  step.stepCode === Constants.StepCode.BARCODEESIGN_POD)
              ) {
                navigation.navigate('ScanQr', {
                  job: job,
                  stepCode: step.stepCode,
                  orderList: orderList,
                  actionModel: actionModel,
                  photoTaking: photoTaking,
                  batchJob: batchJob,
                });
              } else if (
                step &&
                (step.stepCode === Constants.StepCode.ESIGN_POD ||
                  step.stepCode === Constants.StepCode.ESIGNBARCODE_POD ||
                  step.stepCode === Constants.StepCode.ESIGN_POC)
              ) {
                navigation.navigate('Esign', {
                  job: job,
                  stepCode: step.stepCode,
                  action: actionModel,
                  photoTaking: photoTaking,
                });
              } else {
                if (batchJob && batchJob.length > 0) {
                  setIsLoading(true);
                  await batchJobActionMapper(
                    job.id,
                    tempActionModel,
                    step.stepCode,
                    batchJob,
                    true,
                  );
                  isUpdatePhotoSyncStatusNeeded = true;
                  setIsLoading(false);
                } else if (!isExist) {
                  await addNewAction(tempActionModel);
                  updatePhotoSyncStatusByAction();
                  const isSuccess = true;

                  updateJobInLocalDb(
                    job,
                    step.stepCode,
                    tempActionModel,
                    isSuccess,
                  );
                }

                isUpdatePhotoSyncStatusNeeded = true;
              }
              break;
          }
        }
      } else if (actionModel.actionType === Constants.ActionType.TAKE_PHOTO) {
        // cache it till user select reason to avoid background sync incompleted action
        let tempPendingActionList = [];
        tempPendingActionList.push(tempActionModel);
        AsyncStorage.setItem(
          Constants.PENDING_ACTION_LIST,
          JSON.stringify(tempPendingActionList),
        );
        isUpdatePhotoSyncStatusNeeded = true;
      } else {
        if (batchJob && batchJob.length > 0) {
          setIsLoading(true);
          await batchJobActionMapper(
            job.id,
            tempActionModel,
            step.stepCode,
            batchJob,
            true,
          );
          isUpdatePhotoSyncStatusNeeded = true;
          setIsLoading(false);
        } else if (!isExist) {
          await addNewAction(tempActionModel);
        }
        if (actionModel.actionType !== Constants.ActionType.TAKE_PHOTO) {
          await JobHelper.updateJobWithExceptionReason(
            job.id,
            actionModel,
            step.stepCode,
            epodRealm,
          );
        }
        isUpdatePhotoSyncStatusNeeded = true;
      }

      if (isUpdatePhotoSyncStatusNeeded) {
        updatePhotoSyncStatusByAction();
      }
    } else {
      alert(translationString.no_photo);
    }
  };

  const updateJobInLocalDb = async (
    jobModel,
    currentStepCode,
    actionModel,
    isSuccess,
  ) => {
    try {
      JobHelper.updateJob(
        jobModel,
        currentStepCode,
        actionModel,
        isSuccess,
        epodRealm,
      );
      return true;
    } catch (error) {
      alert('Update Job Error: ' + error);
      return false;
    }
  };

  const updatePhotoSyncStatusByAction = async () => {
    try {
      await PhotoRealmManager.updatePhotoSyncStatusByAction(
        actionModel.guid,
        Constants.SyncStatus.SYNC_PENDING,
        epodRealm,
      );

      if (actionModel.actionType === Constants.ActionType.TAKE_PHOTO) {
        gotoPhotoReason();
      } else {
        actionSyncAndRefreshJobList();
      }
    } catch (error) {
      alert('Update Photo SyncStatus: ' + error);
    }
  };

  const addNewAction = async (actionModel) => {
    try {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        ActionRealmManager.insertNewAction(actionModel, epodRealm);
      }, 1000);
    } catch (error) {
      alert('Add Action Error: ' + error);
    }
  };

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }

    let payload = {
      isRefresh: true,
    };

    AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    navigation.popToTop();
  };

  const gotoPhotoReason = () => {
    navigation.navigate('PhotoReason', {
      job: job,
      reasonType: Constants.ReasonType.PHOTO_REASON,
      actionModel: actionModel,
      stepCode: step && step.stepCode ? step.stepCode : '',
      batchJob: batchJob,
      from: from,
      isGeneralPhotoTaking: true,
    });
  };

  const exportToGallery = async () => {
    try {
      setIsLoading(true);
      const albums = await CameraRoll.getAlbums();
      const response = await checkCameraRoll();
      if (response) {
        await deleteExistingPhoto();

        for (var photoModel of cameraModel.photos) {
          const result = await CameraRoll.save(photoModel.file, {
            type: 'photo',
            album: `${Constants.EXPORT_PHOTO_ALBUM}/${job.id}`,
          });
        }
        Toast.ToastMessage({
          text1: translationString.export_photo_success,
          text2: `${Constants.EXPORT_PHOTO_ALBUM}/${job.id}`,
        });
      }
    } catch (err) {
      console.log(err);
      Toast.ToastMessageError({
        text1: translationString.export_photo_fail.toString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExistingPhoto = async () => {
    const albumName =
      Platform.OS === 'ios'
        ? `${Constants.EXPORT_PHOTO_ALBUM}/${job.id}`
        : `${job.id}`;
    let isNextPage = false;
    let photoUri = [];
    let maxCount = 0;

    const deleteFunction = async () => {
      return await CameraRoll.getPhotos({
        first: 20,
        groupTypes: 'Album',
        groupName: albumName,
        assetType: 'Photos',
      });
    };

    const a = await deleteFunction();

    if (a) {
      for (var photo of a.edges) {
        photoUri.push(photo.node.image.uri);
      }

      isNextPage = a.page_info?.has_next_page;
      while (isNextPage) {
        if (maxCount === 2) {
          break;
        }
        maxCount++;

        const b = await deleteFunction();

        for (var photo of b.edges) {
          photoUri.push(photo.node.image.uri);
        }
        isNextPage = b.page_info?.has_next_page;
      }
    }

    if (photoUri && photoUri.length > 0) {
      CameraRoll.deletePhotos(photoUri);
    }
  };

  const checkCameraRoll = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    const response = await GeneralHelper.checkCameraRollPermission();
    return response;
  };

  const getFilteredBatchJob = () => {
    let selectedJob = batchJob?.filter((x) => x.isSelected === true);
    let selectedJobCheck = selectedJob?.filter((x) => x.id !== job.id);

    if (selectedJobCheck && selectedJobCheck.length > 0) {
      selectedJob = selectedJob?.sort((a, b) => a.customerId - b.customerId);
    } else {
      selectedJob = null;
    }
    return selectedJob;
  };

  const getUploadImageQuality = () => {
    return ConfigurationRealmManager.getUploadImageQuanlity(epodRealm);
  };

  useEffect(() => {
    let step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    setStep(step);

    let photoList = [];
    let photosModel = [];

    if (isExportPhoto) {
      photosModel = PhotoRealmManager.getPhotoByJobIdExceptStatus(
        Constants.SyncStatus.PENDING_SELECT_PHOTO,
        job.id,
        epodRealm,
      );
    } else {
      photosModel = PhotoRealmManager.getAllPendingFileByAction(
        actionModel.guid,
        Constants.SyncStatus.PENDING_SELECT_PHOTO,
        epodRealm,
      );
    }

    photosModel.map((item) => {
      let itemModel = GeneralHelper.convertRealmObjectToJSON(item);
      photoList.push(itemModel);
    });

    let payload = {photos: photoList};
    dispatch(createAction(ActionType.SET_PENDING_PHOTO, payload));
  }, []);

  return {
    onPressPhoto,
    addPhoto,
    deletePhoto,
    showHideDialog,
    takePhotoFromCamera,
    getPhotoFromGallery,
    submitPhoto,
    exportToGallery,
    selectedItem,
    photoPreview,
    isModalVisible,
    cameraModel,
    isExportPhoto,
    isLoading,
  };
};
