import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image, Alert} from 'react-native';
import * as Constants from '../../../CommonConfig/Constants';
import {translationString} from '../../../Assets/translation/Translation';
import BackButton from '../../../Assets/image/icon_back_white.png';
import {
  getSelfSync,
  grabManifest,
  getNextManifestApi,
  getDoSelfSync,
  getContainerJob,
  resetManifest,
  getManifestByContainer,
  checkDo,
  grabDoManifest,
} from '../../../ApiController/ApiController';
import * as JobHelper from '../../../Helper/JobHelper';
import {useSelector, useDispatch} from 'react-redux';
import * as ManifestRealmManager from '../../../Database/realmManager/ManifestRealmManager';
import {IndexContext} from '../../../Context/IndexContext';
import * as ActionType from '../../../Actions/ActionTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAction} from '../../../Actions/CreateActions';
import {navigate} from '../../../rootNavigation';
import {useMasterData} from '../../MasterData/useMasterData';

export const useSelfAssignment = (route, navigation) => {
  const {callGetMasterDataApi} = useMasterData();
  const manifestId = route.params.manifestId ? route.params.manifestId : 0;
  const removeManifest = route.params.removeManifest
    ? route.params.removeManifest
    : 0;
  const companyId = route.params.companyId ? route.params.companyId : 0;
  const partyCode = route.params.partyCode ? route.params.partyCode : '';
  const orderNum = route.params.orderNum ? route.params.orderNum : '';
  const container = route.params.containerId ? route.params.containerId : '';

  const networkModel = useSelector((state) => state.NetworkReducer);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [manifest, setManifest] = useState({});
  const [orderList, setOrderList] = useState([]);
  const [orderItemList, setOrderItemList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const {auth, epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const [userModel, setUserModel] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const dispatch = useDispatch();
  const [plateNo, setPlateNo] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(Constants.PLATE_NO).then((res) => {
      const infoModel = JSON.parse(res);
      if (infoModel && infoModel.plateNo && infoModel.plateNo.length > 0) {
        setPlateNo(infoModel.plateNo);
      }
    });

    AsyncStorage.getItem(Constants.USER_MODEL).then((res) => {
      if (res) {
        let userModel = JSON.parse(res);
        setUserModel(userModel);
        callInitAPI(userModel);
      }
    });
  }, []);

  const callInitAPI = async (userModel) => {
    setIsShowLoadingIndicator(true);
    if (networkModel.isConnected) {
      if (isResetManifest()) {
        callResetManifestApi();
      } else if (isContainer()) {
        callGetContainerJobApi(userModel);
      } else if (isManifest()) {
        callGetSelfSyncApi();
      } else if (isOrderNum()) {
        callGetDoSelfSyncApi();
      }
    } else {
      setAlertMsg(translationString.no_internet_connection);
      navigation.goBack();
    }

    setIsShowLoadingIndicator(false);
  };

  const callGetSelfSyncApi = async () => {
    try {
      const response = await getSelfSync(manifestId);

      let resultModel = response.data;
      if (resultModel) {
        setResult(resultModel);
      } else {
        setIsShowLoadingIndicator(false);
        setAlertMsg(translationString.please_try_again);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const callGetDoSelfSyncApi = async () => {
    try {
      const response = await getDoSelfSync(manifestId);

      let resultModel = response.data;
      if (resultModel) {
        setResult(resultModel);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const callGetContainerJobApi = async (userModel) => {
    try {
      const response = await getContainerJob(
        container,
        userModel.id,
        manifestId,
      );

      let resultModel = response.data;
      if (resultModel) {
        setResult(resultModel);
      } else {
        setIsShowLoadingIndicator(false);
        setAlertMsg(translationString.please_try_again);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const setResult = (resultModel) => {
    setManifest(resultModel);
    if (resultModel.orders) {
      setOrderList(resultModel.orders);
    }
    if (resultModel.jobs) {
      setJobList(resultModel.jobs);
    }
    if (resultModel.orderItems) {
      setOrderItemList(resultModel.orderItems);
    }
  };

  const callResetManifestApi = async () => {
    try {
      const response = await resetManifest(removeManifest);

      let resultModel = response.data;
      if (resultModel) {
        callGetNextManifestDataApi();
      } else {
        setIsShowLoadingIndicator(false);
        setAlertMsg(translationString.please_try_again);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const getJobByOrder = (order) => {
    const data = jobList.filter((item) => {
      return item.id === order.jobId;
    });

    return data && data.length > 0 ? data[0] : {};
  };

  const getTrackingNumberOrCount = (order) => {
    const data = jobList.filter((item) => {
      return item.id === order.jobId;
    });

    const job = data && data.length > 0 ? data[0] : {};

    return job ? JobHelper.getTrackingNumberOrCount(job) : {};
  };

  const getButtonText = () => {
    let tempTotal = 0;

    orderItemList.forEach((orderItem) => {
      tempTotal += orderItem.expectedQuantity;
    });

    return translationString.confirm + '(' + tempTotal + ')';
  };

  const getPeriod = (order) => {
    /*    display date differently
    1. Before 1600 = From null To 1600   (1600前)
    2. After 1600 = From 1600 To null   (1600後)
    3. At 1600 = From 1600 to 1600   (準時1600)
    4. From 00 to 00 (No time)
    5. Between = From 1200 To 1400 (11:00 - 14:00)*/

    const data = jobList.filter((item) => {
      return item.id === order.jobId;
    });

    const job = data && data.length > 0 ? data[0] : {};
    return job ? JobHelper.getPeriod(job) : {};
  };

  const getOrderItemsByOrder = (order) => {
    const orderItem = orderItemList.filter((item) => {
      return item.orderId === order.id;
    });

    return orderItem ? orderItem : [];
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
      headerRight: null,
      headerTitle: translationString.job_detail_title,
    });
  }, [navigation]);

  const cancelButtonOnPressed = () => {
    navigation.goBack();
  };

  const confirmButtonOnPressed = () => {
    if (networkModel.isConnected) {
      if (isContainer()) {
        setIsShowLoadingIndicator(true);
        callGetManifestByContainerIdApi();
      } else if (isManifest()) {
        setIsShowLoadingIndicator(true);
        callGrabManifestApi(manifestId, null, companyId);
      } else if (isOrderNum()) {
        setIsShowLoadingIndicator(true);
        callCheckDoApi();
      }
    } else {
      setAlertMsg(translationString.no_internet_connection);
    }
  };

  const callGrabManifestApi = async (Id, username, CompanyId) => {
    try {
      const response = await grabManifest(Id, username, CompanyId);
      let resultModel = response.data;
      if (resultModel) {
        callGetNextManifestDataApi();
      } else {
        setIsShowLoadingIndicator(false);
        setAlertMsg(translationString.please_try_again);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const callGetManifestByContainerIdApi = async () => {
    try {
      const response = await getManifestByContainer(
        container,
        userModel.id,
        manifestId,
      );
      let resultModel = response.data;
      if (resultModel) {
        setResult(resultModel);

        callGrabManifestApi(resultModel.id, null, 0);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const callCheckDoApi = async () => {
    try {
      const response = await checkDo(orderNum, null, partyCode);
      let resultModel = response.data;
      if (resultModel) {
        if (resultModel.message && resultModel.message.length > 0) {
          setIsShowLoadingIndicator(false);
          //confirm dialog
          Alert.alert(
            '',
            translationString.delivery_date_diff,
            [
              {
                text: translationString.cancel,
                onPress: () => {},
              },
              {
                text: translationString.confirm,
                onPress: () => {
                  setIsShowLoadingIndicator(true);
                  callGrabDoManifestApi(); //assignManifest
                },
              },
            ],
            {cancelable: false},
          );
        } else {
          callGrabDoManifestApi(); //assignManifest
        }
      } else {
        setIsShowLoadingIndicator(false);
        setAlertMsg(translationString.please_try_again);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const callGetNextManifestDataApi = async () => {
    try {
      const response = await getNextManifestApi();

      let resultModel = response.data;
      if (response.status === Constants.NO_MANIFEST_ERROR_CODE) {
        let msg = translationString.please_try_again;
        alert(msg);
      } else {
        if (resultModel) {
          await callGetMasterDataApi();
          await checkingBeforeUpdateLocalDb(resultModel);
        }
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const callGrabDoManifestApi = async () => {
    try {
      const response = await grabDoManifest(orderNum, null, partyCode);

      let resultModel = response.data;
      if (resultModel) {
        callGetNextManifestDataApi();
      } else {
        setIsShowLoadingIndicator(false);
        setAlertMsg(translationString.please_try_again);
      }
    } catch (err) {
      handleErrorMessage(err);
    }
  };

  const checkForExsitingManifest = async (manifestResult, realm) => {
    let isExist = false;
    const tempManifest = await ManifestRealmManager.geManifestByManifestId(
      manifestResult,
      realm,
    );
    if (tempManifest && tempManifest.length > 0) {
      isExist = true;
    }

    return isExist;
  };

  const checkingBeforeUpdateLocalDb = async (manifestResult) => {
    manifestResult.jobs.map((jobModel) => {
      jobModel.currentStepCode = jobModel.currentStep + 1;
    });

    if (isResetManifest()) {
      await ManifestRealmManager.deleteAllManifestData(epodRealm);
    }

    const isExist = await checkForExsitingManifest(manifestResult, epodRealm);

    if (isExist) {
      updateManifestData(manifestResult);
    } else {
      insertManifestData(manifestResult);
    }

    EpodRealmHelper.updateManifestData(manifestResult);

    if (
      userModel &&
      userModel.plateNoRequest &&
      !(plateNo && plateNo.length > 0)
    ) {
      auth.updatePlateNo();
    } else {
      if (isExist || isResetManifest()) {
        navigation.popToTop();
      } else {
        auth.loginWithOrder();
      }
    }

    setIsShowLoadingIndicator(false);
  };

  const updateManifestData = async (manifestData) => {
    try {
      ManifestRealmManager.updateManifestData(manifestData, epodRealm);
    } catch (error) {
      alert('update manifest data (no order):' + error);
    }
  };

  const insertManifestData = async (manifestData) => {
    try {
      ManifestRealmManager.insertNewManifest(manifestData, epodRealm);
    } catch (error) {
      alert('insert manifest data (no order):' + error);
    }
  };

  const isResetManifest = () => {
    return removeManifest > 0;
  };

  const isManifest = () => {
    return manifestId > 0;
  };

  const isContainer = () => {
    return container && container.length > 0;
  };

  const isOrderNum = () => {
    return orderNum && orderNum.length > 0;
  };

  const handleErrorMessage = (err) => {
    setIsShowLoadingIndicator(false);

    console.log('error Message', err);

    if (err && err.response && err.response.data) {
      let errorModel = err.response.data;
      const errorMessage =
        errorModel &&
        errorModel.errorMessage &&
        errorModel.errorMessage.length > 0
          ? errorModel.errorMessage
          : translationString.please_try_again;
      setAlertMsg(errorMessage);
    }
  };

  return {
    alertMsg,
    orderList,
    isShowLoadingIndicator,
    getJobByOrder,
    getTrackingNumberOrCount,
    getPeriod,
    getOrderItemsByOrder,
    cancelButtonOnPressed,
    confirmButtonOnPressed,
    getButtonText,
  };
};
