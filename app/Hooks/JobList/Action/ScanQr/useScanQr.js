import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';
import BleManager from 'react-native-ble-manager';
import {useFocusEffect} from '@react-navigation/native';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {translationString} from '../../../../Assets/translation/Translation';
import {
  TouchableOpacity,
  Image,
  Alert,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import * as Constants from '../../../../CommonConfig/Constants';
import * as QrCodeHelper from '../../../../Helper/QrCodeHelper';
import {IndexContext} from '../../../../Context/IndexContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RootNavigation from '../../../../rootNavigation';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import {useSelector, useDispatch} from 'react-redux';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import {createAction} from '../../../../Actions/CreateActions';
import * as ActionType from '../../../../Actions/ActionTypes';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as ShopsRealmManager from '../../../../Database/realmManager/ShopsRealmManager';
import * as PhotoHelper from '../../../../Helper/PhotoHelper';
import {PODHelper} from './../../../../Helper/PODHelper';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const useScanQr = (route, navigation) => {
  const cameraRef = useRef(null);
  const [isBarcodeScannerEnabled, setBarcodeScannerEnabled] = useState(true);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const {manifestData, epodRealm} = React.useContext(IndexContext);
  const locationModel = useSelector((state) => state.LocationReducer);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const dispatch = useDispatch();
  const weightBinOption = route.params?.option ? route.params.option : null;

  const isExtraStep = route.params?.isExtraStep
    ? route.params.isExtraStep
    : false;

  const job = route.params?.job ? route.params.job : null;
  const isPD = route.params?.isPD ? route.params.isPD : false;
  const additionalParamsJson = route.params?.additionalParamsJson
    ? route.params.additionalParamsJson
    : '';
  const codReasonCode = route.params?.codReasonCode
    ? route.params.codReasonCode
    : 0;
  const stepCode = route.params?.stepCode;
  const orderList = route.params?.orderList;
  const orderItemList = route.params?.orderItemList; // pass from scan sku

  // use to define photo taking flow else it is normal flow
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;
  const [actionModel, setActionModel] = useState(route.params?.actionModel);
  const [isShowPasswordInputModal, setIsShowPasswordInputModal] =
    useState(false);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordChecking, setPasswordChecking] = useState(false);

  const batchJob = route.params?.batchJob;

  const {batchJobActionMapper} = PODHelper();
  const [scanQrResult, setScanQrResult] = useState('');
  const [isShowSkipQR, setIsShowSkipQR] = useState(false);
  const [isError, setIsError] = useState(false);

  // const jobTransferProvider = useJobTransferProvider();

  let filterTimeout;

  useFocusEffect(
    React.useCallback(() => {
      setBarcodeScannerEnabled(true);
    }, []),
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const resetScanFlag = () => {
    setBarcodeScannerEnabled(true);
  };

  const handleQrCode = async (qrCode) => {
    //avoid multiple scan

    if (isExtraStep) {
      confirmSkipScanQR(qrCode);
      return;
    }

    if (isBarcodeScannerEnabled && qrCode.length > 0) {
      setIsShowLoadingIndicator(true);
      setBarcodeScannerEnabled(false);
      console.log('TYPE', QrCodeHelper.getType(qrCode));
      if (QrCodeHelper.isNotOrderNum(qrCode)) {
        switch (QrCodeHelper.getType(qrCode)) {
          case Constants.QRType.MANIFEST_QR.toString():
            const manifestID = QrCodeHelper.getManifestId(qrCode);
            if (!isNaN(manifestID)) {
              setIsShowLoadingIndicator(false);
              // setBarcodeScannerEnabled(true);
              RootNavigation.navigate('SelfAssignment', {
                manifestId: manifestID,
                companyId: QrCodeHelper.getCompanyId(qrCode),
              });
            } else {
              setIsShowLoadingIndicator(false);
              Alert.alert(
                '',
                translationString.manifest_invalid,
                [
                  {
                    text: translationString.premission_ok_btn,
                    onPress: () => {
                      resetScanFlag();
                    },
                  },
                ],
                {cancelable: false},
              );
            }
            break;

          case Constants.QRType.REMOVE_ALLJOB.toString():
            setIsShowLoadingIndicator(false);
            Alert.alert(
              '',
              translationString.Remove_Job_message,
              [
                {
                  text: translationString.cancel,
                  onPress: () => {
                    resetScanFlag();
                  },
                },
                {
                  text: translationString.confirm,
                  onPress: () => {
                    scanRemoveManifest();
                  },
                },
              ],
              {cancelable: false},
            );
            break;

          case Constants.QRType.BARCODE_POD.toString():
            handleBarcodePOD(qrCode);
            break;

          case Constants.QRType.SHOP_BARCODE_POD.toString():
            handleBarcodePOD(qrCode, true);
            break;

          case Constants.QRType.Container_Id.toString():
            scanContainer(qrCode);
            break;

          default:
            break;
        }
      } else if (QrCodeHelper.getSystem(qrCode) === 'K5') {
        scanK5();
      }
      // else if (QrCodeHelper.getSystem(qrCode) === 'JT') {
      //   scanJT(qrCode);
      // }
      else {
        //check scan jobbin
        const jobBin = QrCodeHelper.searchJobBin(qrCode, epodRealm);
        console.log(jobBin);
        if (jobBin && jobBin.length > 0) {
          navigation.navigate('SelectReason', {
            job: job,
            jobBin: jobBin,
            reasonType: Constants.ReasonType.POD_EX,
            stepCode: stepCode,
          });
        } else {
          QrCodeHelper.insertSampleJobBin(epodRealm);
          console.log('insert jobbin sample');
        }

        //cehck scan job
        QrCodeHelper.searchJob(qrCode, epodRealm, resetScanFlag);
        setIsShowLoadingIndicator(false);
      }
    }
  };

  const confirmSkipScanQR = (result) => {
    if (!result) {
      setIsError(true);
      return;
    }
    setIsError(false);
    setIsShowSkipQR(false);
    navigation.navigate({
      name: 'SelectReason',
      params: {scanResult: result},
      merge: true,
    });
    return;
  };

  const scanContainer = (qrCode) => {
    const manifestId = manifestData ? manifestData.id : 0;
    const containerId = QrCodeHelper.getManifestId(qrCode);
    setIsShowLoadingIndicator(false);
    RootNavigation.navigate('SelfAssignment', {
      manifestId: manifestId,
      containerId: containerId,
    });
  };

  const scanRemoveManifest = () => {
    const manifestId = manifestData ? manifestData.id : 0;
    setIsShowLoadingIndicator(false);
    RootNavigation.navigate('SelfAssignment', {
      removeManifest: manifestId,
    });
  };

  const scanJT = (qrCode) => {
    const mode = qrCode.split('|')[0]; //JT
    const username = qrCode.split('|')[1];
    const parcelQty = qrCode.split('|')[2];
    const transferReason = qrCode.split('|')[3];
    const previousManifestId = qrCode.split('|')[4];
    const trackingList = qrCode.split('|').slice(5);
    setIsShowLoadingIndicator(false);
    navigation.navigate('JobTransfer', {
      mode: mode,
      fromUser: username,
      parcelQty: parcelQty,
      transferReason: transferReason,
      previousManifestId: previousManifestId,
      trackingList: trackingList,
    });
  };

  const scanK5 = (qrCode) => {
    setIsShowLoadingIndicator(false);
    RootNavigation.navigate('SelfAssignment', {
      partyCode: QrCodeHelper.getCompanyId(qrCode),
      orderNum: QrCodeHelper.getData(
        qrCode,
        Constants.QR_POSITION.BLUETOOTH_NAME,
      ),
    });
  };

  const handleBarcodePOD = async (qrCode, isShop = false) => {
    const scanJobPassword = QrCodeHelper.getManifestId(qrCode);
    let isSuccess = false;
    let shop;

    if (isShop) {
      shop = ShopsRealmManager.selectShopById(epodRealm, job.shopId);
    }
    //ePOD|7|JobPassword|0
    if (!isShop && job && job.jobPassword.toString() === scanJobPassword) {
      isSuccess = true;
      await processBarCodePOD(
        Constants.VERIFICATION_METHOD.QR_TYPE,
        stepCode,
        actionModel,
        additionalParamsJson,
        photoTaking,
        job,
        orderList,
        orderItemList,
        route.params?.totalActualCodAmt,
      );
    } else if (isShop && job && shop && scanJobPassword === shop.qrContent) {
      //ePOD|8|JobPassword|0 SHOP_BARCODE_POD

      //TODO Handle Error
      isSuccess = true;
      await processBarCodePOD(
        Constants.VERIFICATION_METHOD.SHOP_QR,
        stepCode,
        actionModel,
        additionalParamsJson,
        photoTaking,
        job,
        orderList,
        orderItemList,
        route.params?.totalActualCodAmt,
      );
    }

    if (!isSuccess) {
      setIsShowLoadingIndicator(false);
      Alert.alert(
        '',
        translationString.incorrect_barcode,
        [
          {
            text: translationString.premission_ok_btn,
            onPress: () => {
              setBarcodeScannerEnabled(true);
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  const processBarCodePOD = async (
    method,
    _stepCode,
    _actionModel,
    _additionalParamsJson,
    _photoTaking,
    _job,
    _orderList,
    _orderItemList,
    totalActualCodAmt,
  ) => {
    //TODO Handle EsignBarcode
    if (_stepCode === Constants.StepCode.BARCODEESIGN_POD) {
      setIsShowLoadingIndicator(false);

      const isSuccess = true;
      let action = _actionModel
        ? _actionModel
        : ActionHelper.generateActionModel(
            _job.id,
            _stepCode,
            isSuccess,
            locationModel,
            null,
            _photoTaking,
          );

      if (_orderList && _orderList.length > 0) {
        action.orderId = _orderList[0].id;
      }
      let additionalParamsJsonAdditionalString = '';
      if (_additionalParamsJson) {
        const additionalParamsJsonAdditional = JSON.parse(
          _additionalParamsJson,
        );
        additionalParamsJsonAdditional.verificationMethod = method;
        additionalParamsJsonAdditionalString = JSON.stringify(
          additionalParamsJsonAdditional,
        );
      } else {
        const newAdditionalParamsJson = {
          verificationMethod: method,
        };
        additionalParamsJsonAdditionalString = JSON.stringify(
          newAdditionalParamsJson,
        );
      }
      action.additionalParamsJson = additionalParamsJsonAdditionalString;
      navigation.navigate('Esign', {
        job: _job,
        action: action,
        stepCode: _stepCode,
        orderList: _orderList,
        orderItemList: _orderItemList,
        totalActualCodAmt: totalActualCodAmt,
        photoTaking: _photoTaking,
        verificationMethod: method,
        isPD: isPD,
      });
    } else if (isPD) {
      if (_actionModel) {
        if (_additionalParamsJson) {
          let additionalParamsJsonAdditional = JSON.parse(
            _additionalParamsJson,
          );
          additionalParamsJsonAdditional.verificationMethod = method;

          _actionModel.additionalParamsJson = JSON.stringify(
            additionalParamsJsonAdditional,
          );
        } else {
          const additionParams = {
            verificationMethod: method,
          };

          _actionModel.additionalParamsJson = JSON.stringify(additionParams);
        }
        await ActionHelper.insertPartialDeliveryActionAndOrderItem(
          _job,
          _actionModel,
          _orderList,
          _orderItemList,
          epodRealm,
          false,
          _photoTaking,
        );
        actionSyncAndRefreshJobList();
        await updatePhotoStatus(_actionModel);
        setIsShowLoadingIndicator(false);
        navigation.popToTop();
      } else {
        setIsShowLoadingIndicator(false);
        navigation.goBack();
      }
    } else {
      const isSuccess = true;
      let action = _actionModel
        ? _actionModel
        : ActionHelper.generateActionModel(
            _job.id,
            _stepCode,
            isSuccess,
            locationModel,
            null,
            _photoTaking,
          );

      if (_orderList && _orderList.length > 0) {
        action.orderId = _orderList[0].id;
      }

      if (_additionalParamsJson) {
        let additionalParamsJsonAdditional = JSON.parse(_additionalParamsJson);
        additionalParamsJsonAdditional.verificationMethod = method;

        action.additionalParamsJson = JSON.stringify(
          additionalParamsJsonAdditional,
        );
      } else {
        const additionParams = {
          verificationMethod: method,
        };

        action.additionalParamsJson = JSON.stringify(additionParams);
      }

      if (
        _orderItemList &&
        _orderItemList.some((item) => item.scanSkuTime !== '')
      ) {
        action.syncItem = Constants.SyncStatus.SYNC_PENDING;
      }

      if (batchJob && batchJob.length > 0) {
        await batchJobActionMapper(
          job.id,
          action,
          stepCode,
          batchJob,
          photoTaking,
        );
        actionSyncAndRefreshJobList();
      } else {
        await addNewAction(action);
        if (_orderItemList) {
          await ActionHelper.insertScanSkuActionAction(
            action,
            _orderItemList,
            epodRealm,
          );
        }

        const isJobUpdated = await updateJobInLocalDb(
          _job,
          _stepCode,
          action,
          isSuccess,
        );

        await updatePhotoStatus(action);

        if (isJobUpdated) {
          actionSyncAndRefreshJobList();
        }
      }
      navigation.popToTop();
      setIsShowLoadingIndicator(false);
    }
  };

  const updatePhotoStatus = async (actionModel) => {
    if (photoTaking) {
      // update photo status for action with photo flow for pending upload
      await PhotoHelper.updatePhotoSyncStatusByAction(actionModel, epodRealm);
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

  const actionSyncAndRefreshJobList = () => {
    if (networkModel.isConnected) {
      startActionSync();
    }
    let payload = {
      isRefresh: true,
    };
    dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
    AsyncStorage.removeItem(Constants.PENDING_ACTION_LIST);
  };

  const handlePasswordInput = () => {
    setIsShowPasswordInputModal(true);
    setBarcodeScannerEnabled(false);
  };

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
      headerTitle: translationString.scan,
      headerRight: null,
    });
  }, [navigation]);

  const cancelButtonOnPress = () => {
    setPasswordError('');
    setPassword('');
    setIsShowPasswordInputModal(false);
    setBarcodeScannerEnabled(true);
  };

  const confirmButtonOnPress = async () => {
    setIsShowPasswordInputModal(false);
    setPasswordChecking(true);

    var shop = ShopsRealmManager.selectShopById(epodRealm, job.shopId);

    if (shop && job && password === shop.qrContent) {
      setPasswordError('');
      navigateToSelectSkipPodReason(
        Constants.VERIFICATION_METHOD.SHOP_PASSWORD_TYPE,
      );
      setIsShowPasswordInputModal(false);
    } else if (job && job.jobPassword !== '') {
      if (password === job.jobPassword) {
        setPasswordError('');
        navigateToSelectSkipPodReason(
          Constants.VERIFICATION_METHOD.PASSWORD_TYPE,
        );
        //await processBarCodePOD(Constants.VERIFICATION_METHOD.PASSWORD_TYPE);
        setIsShowPasswordInputModal(false);
      } else {
        setIsShowPasswordInputModal(true);
        setPasswordError(translationString.password_input_error);
      }
    }

    setPasswordChecking(false);
  };

  const navigateToSelectSkipPodReason = (method) => {
    let action = actionModel
      ? actionModel
      : ActionHelper.generateActionModel(
          job.id,
          stepCode,
          true,
          locationModel,
          null,
          photoTaking,
        );

    navigation.navigate('BarcodePODSelectReason', {
      job: job,
      actionModel: action,
      stepCode: stepCode,
      orderList: orderList,
      orderItemList: orderItemList,
      totalActualCodAmt: route.params?.totalActualCodAmt,
      photoTaking: photoTaking,
      reasonType: Constants.ReasonType.BARCODEPOD_SKIP_REASON,
      method: method,
      batchJob: batchJob,
    });
  };

  const textOnChange = (text) => {
    setPassword(text);
    setPasswordError('');
  };

  return {
    cameraRef,
    isShowLoadingIndicator,
    stepCode,
    isShowPasswordInputModal,
    password,
    passwordError,
    isPasswordChecking,
    scanQrResult,
    isShowSkipQR,
    isExtraStep,
    isError,
    cancelButtonOnPress,
    confirmButtonOnPress,
    textOnChange,
    handleBack,
    handleQrCode,
    handlePasswordInput,
    processBarCodePOD,
    confirmSkipScanQR,
    setScanQrResult,
    setIsShowSkipQR,
    weightBinOption,
  };
};
