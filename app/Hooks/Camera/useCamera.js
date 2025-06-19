import React, {useState, useRef, useEffect} from 'react';
import * as Constants from '../../CommonConfig/Constants';
import * as PhotoRealmManager from '../../Database/realmManager/PhotoRealmManager';
import * as RootNavigation from '../../rootNavigation';
import * as JobHelper from '../../Helper/JobHelper';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {IndexContext} from '../../Context/IndexContext';
import {useSelector, useDispatch} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import moment from 'moment';
import {addEventLog} from '../../Helper/AnalyticHelper';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import * as ConfigurationRealmManager from '../../Database/realmManager/ConfigurationRealmManager';

export const useCamera = (route, navigation) => {
  const cameraRef = useRef(null);
  const locationModel = useSelector((state) => state.LocationReducer);
  const userModel = useSelector((state) => state.UserReducer);
  const job = route.params.job;
  const stepCode = route.params.stepCode;
  const needScanSku = route.params.needScanSku;
  const batchJob = route.params.batchJob;
  const from = route.params.from;

  // use for photo taking flow use to maintain photo taking photo when user click fail reason and cancel
  // one of example : photo flow -> collect -> fail -> reason -> take photo (use flag here) -> back to collect screen -> success
  const isMaintainPhotoFlowPhoto = route.params?.isMaintainPhotoFlowPhoto
    ? route.params.isMaintainPhotoFlowPhoto
    : false;
  // use to define photo taking flow else it is exception or normal photo take
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;

  const isSkipSummary = route.params?.isSkipSummary
    ? route.params?.isSkipSummary
    : false;

  const [currentPhotoPath, setCurrentPhotoPath] = useState('');
  let actionType = Constants.ActionType.TAKE_PHOTO;

  if (photoTaking && stepCode === Constants.StepCode.COLLECT) {
    // temporary set COLLECT_SUCCESS for photo flow, will update after user click on button
    actionType = Constants.ActionType.COLLECT_SUCCESS;
  } else if (
    photoTaking &&
    (stepCode === Constants.StepCode.PRE_CALL ||
      stepCode === Constants.StepCode.PRE_CALL_COLLECT)
  ) {
    // temporary set PRE_CALL_SUCCESS for photo flow, will update after user click on button
    actionType = Constants.ActionType.PRE_CALL_SUCCESS;
  } else if (photoTaking && stepCode === Constants.StepCode.WEIGHT_CAPTURE) {
    // temporary set PRE_CALL_SUCCESS for photo flow, will update after user click on button
    actionType = Constants.ActionType.COLLECT_SUCCESS;
  }

  const [actionModel, setActionModel] = useState(
    route.params.actionModel
      ? route.params.actionModel
      : {
          guid: uuidv4(),
          actionType: actionType,
          jobId: job.id,
          operateTime: moment().format(),
          syncItem: Constants.SyncStatus.SYNC_SUCCESS,
          syncStatus: Constants.SyncStatus.SYNC_PENDING,
          syncPhoto: Constants.SyncStatus.SYNC_PENDING,
          longitude: locationModel.longitude,
          latitude: locationModel.latitude,
        },
  );
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);

  const gotoSelectPhotoScreen = async () => {
    // if (
    //   actionModel.actionType !== Constants.ActionType.TAKE_PHOTO &&
    //   actionModel.actionType !== Constants.ActionType.PARTIAL_DLEIVER_FAIL
    // ) {
    //   await JobHelper.updateJobWithExceptionReason(
    //     job.id,
    //     actionModel,
    //     stepCode,
    //     epodRealm,
    //   );
    // }

    const screenName = photoTaking ? 'PhotoFlowSelectPhoto' : 'SelectPhoto';

    RootNavigation.navigate(screenName, {
      job: job,
      actionModel: actionModel,
      photoTaking: photoTaking, //use for photo taking flowr efer to useCamara.js line 22
      needScanSku: needScanSku,
      isSkipSummary: isSkipSummary,
      batchJob: batchJob,
      from: from,
    });
  };

  const savePhotoToDb = async (photoModel) => {
    try {
      PhotoRealmManager.insertNewPhotoData(photoModel, epodRealm);
    } catch (error) {
      addEventLog('savePhotoToDb', {
        user: `${userModel.id.toString()}; error: ${error}; data: ${job.id.toString()}`,
      });
      alert('Add Photo Error: ' + error);
    }
  };

  const generatePhotoModel = (photoPath) => {
    const photoModel = {
      jobId: job.id,
      actionId: actionModel.guid,
      file: photoPath,
      uuid: uuidv4(),
      source: Constants.SourceType.CAMERA,
      createDate: moment().format(),
    };
    savePhotoToDb(photoModel);
  };

  const takePhoto = async () => {
    const quality = getUploadImageQuality();
    const options = {
      quality: quality,
      base64: false,
      width: 1920,
      height: 1920,
    };
    const data = await cameraRef.current.takePictureAsync(options);
    const response = await checkCameraRoll();
    if (response) {
      await CameraRoll.save(data.uri);
    }
    setCurrentPhotoPath(data.uri);
    generatePhotoModel(data.uri);
  };

  const photoPreview = () => {
    if (currentPhotoPath) {
      gotoSelectPhotoScreen();
    } else {
      getPhotoFromGallery();
    }
  };

  const getPhotoFromGallery = () => {
    const quality = getUploadImageQuality();
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 10,
      compressImageQuality: quality,
      compressImageMaxWidth: 1920,
      compressImageMaxHeight: 1920,
    }).then((images) => {
      if (images.values != null) {
        setCurrentPhotoPath(images[0].path);
        images.map((item) => {
          let model = {
            jobId: job.id,
            actionId: actionModel.guid,
            file: item.path,
            uuid: uuidv4(),
            syncStatus: Constants.SyncStatus.PENDING_SELECT_PHOTO,
            source: Constants.SourceType.PHOTO_GALLERY,
          };
          console.log('Select Photo From Gallery', actionModel.guid);
          savePhotoToDb(model);
        });
      }
    });
  };

  const checkCameraRoll = async () => {
    const response = await GeneralHelper.checkCameraRollPermission();
    return response;
  };

  const getUploadImageQuality = () => {
    return ConfigurationRealmManager.getUploadImageQuanlity(epodRealm);
  };

  useEffect(() => {
    //Handle for kill app relaunch,used to avoid delete all photo except current action's photos
    if (!isMaintainPhotoFlowPhoto) {
      PhotoRealmManager.deleteAllPendingSelectPhotoDataExcptCurrentAction(
        epodRealm,
        actionModel.guid,
      );
    }

    //Handle for kill app relaunch,used to set the last photo for camera screen
    let pendingPhotosByAction = PhotoRealmManager.getAllPendingFileByAction(
      actionModel.guid,
      Constants.SyncStatus.PENDING_SELECT_PHOTO,
      epodRealm,
    );

    if (pendingPhotosByAction && pendingPhotosByAction.length > 0) {
      setCurrentPhotoPath(
        pendingPhotosByAction[pendingPhotosByAction.length - 1].file,
      );
    } else {
      setCurrentPhotoPath('');
    }
    checkCameraRoll();
    //Handle for kill app relaunch to set the last photo for camera screen
    GeneralHelper.checkCameraPermission(
      () => {},
      () =>
        GeneralHelper.showCameraPermissonAlert(() => {
          navigation.goBack();
        }),
    );
  }, []);

  return {
    cameraRef,
    currentPhotoPath,
    takePhoto,
    gotoSelectPhotoScreen,
    photoPreview,
  };
};
