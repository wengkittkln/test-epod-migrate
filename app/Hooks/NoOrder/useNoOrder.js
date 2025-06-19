/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import * as Constants from '../../CommonConfig/Constants';
import * as ManifestRealmManager from '../../Database/realmManager/ManifestRealmManager';
import {translationString} from '../../Assets/translation/Translation';
import ScanIcon from '../../Assets/image/icon_scanqrcode_orange.png';
import {
  getNextManifestApi,
  userLogoutApi,
} from '../../ApiController/ApiController';
import {IndexContext} from '../../Context/IndexContext';
import * as RootNavigation from '../../rootNavigation';
import {ImageRes} from '../../Assets';
import {useDeltaSync} from '../DeltaSync/useDeltaSync';
import {useMasterData} from '../MasterData/useMasterData';
import * as JobTransferRealmManager from './../../Database/realmManager/JobTransferRealmManager';
import {ToastMessageError} from '../../Components/Toast/ToastMessage';
import * as ApiController from '../../ApiController/ApiController';

export const useNoOrder = (route, navigation) => {
  const networkModel = useSelector((state) => state.NetworkReducer);
  const dispatch = useDispatch();
  const {callGetMasterDataApi} = useMasterData();

  const {callGetDeltaWithArg} = useDeltaSync(
    callGetMasterDataApi,
    'useNoOrder',
  );

  const {auth, epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const [labelText, setLabelText] = useState(
    route.params && route.params.labelText ? route.params.labelText : '',
  );
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(
    route.params && route.params.isShowLoadingIndicator
      ? route.params.isShowLoadingIndicator
      : false,
  );
  const [alertMsg, setAlertMsg] = useState('');
  const {manifestData} = React.useContext(IndexContext);
  const userModel = useSelector((state) => state.UserReducer);

  const checkingBeforeUpdateLocalDb = (manifestResult) => {
    manifestResult.jobs.map((jobModel) => {
      jobModel.currentStepCode = jobModel.currentStep + 1;
    });
    insertManifestData(manifestResult);
    EpodRealmHelper.updateManifestData(manifestResult);
    callGetDeltaWithArg(manifestResult);

    auth.loginWithOrder();
  };

  const insertManifestData = async (manifestData) => {
    try {
      ManifestRealmManager.insertNewManifest(manifestData, epodRealm);
    } catch (error) {
      alert('insert manifest data (no order):' + error);
    }
  };

  const callGetNextManifestDataApi = async () => {
    try {
      const response = await getNextManifestApi();
      setIsShowLoadingIndicator(false);
      let resultModel = response.data;
      if (response.status === Constants.NO_MANIFEST_ERROR_CODE) {
        let isDownloadFailed = true;
        let msg = translationString.no_data;
        auth.loginWithNoOrder(msg, isDownloadFailed);
      } else {
        if (resultModel) {
          checkingBeforeUpdateLocalDb(resultModel);
        }
      }
    } catch (err) {
      let isDownloadFailed = err.response.status === 204 ? false : true;
      let msg =
        err.response.status === 204
          ? translationString.no_data
          : translationString.download_failed;
      setIsShowLoadingIndicator(false);
      auth.loginWithNoOrder(msg, isDownloadFailed);
      setLabelText(msg);
    }
  };

  const cancelButtonOnPressed = async () => {
    if (networkModel.isConnected) {
      var pendingTransferList = await getList();

      if (pendingTransferList && pendingTransferList.length > 0) {
        ToastMessageError({
          text1: translationString.formatString(
            translationString.job_transfers.logoutPendingRequest,
            pendingTransferList.length,
          ),
        });
      } else {
        await userLogoutApi();
        auth.logout();
      }
    } else {
      setAlertMsg(translationString.no_internet_connection);
    }
  };

  const retryButtonOnPressed = () => {
    if (networkModel.isConnected) {
      setIsShowLoadingIndicator(true);
    } else {
      setAlertMsg(translationString.no_internet_connection);
    }
  };

  const getList = async () => {
    var pendingTransferList =
      await JobTransferRealmManager.getPendingJobTransferByDriverTo(
        epodRealm,
        userModel.id,
      );

    return pendingTransferList;
  };

  const getTransferRequestListWhenNoOrder = async () => {
    await ApiController.GetTransferList().then((response) => {
      const jobTransferList = response.data;
      if (jobTransferList && jobTransferList.length > 0) {
        for (var i of jobTransferList) {
          const isExist = JobTransferRealmManager.getPendingJobTransferById(
            i.id,
            epodRealm,
          );

          if (!isExist) {
            JobTransferRealmManager.insertNewItem(i, epodRealm);
          } else {
            JobTransferRealmManager.updateJobTransfer(epodRealm, i);
          }
        }
      }
    });
    setIsShowLoadingIndicator(false);
  };

  useEffect(() => {
    if (alertMsg) {
      setTimeout(() => {
        setAlertMsg('');
      }, 4000);
    }
  }, [alertMsg]);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
    getTransferRequestListWhenNoOrder();
  }, [EpodRealmHelper, epodRealm]);

  useEffect(() => {
    if (isShowLoadingIndicator) {
      if (networkModel.isConnected) {
        callGetNextManifestDataApi();
      } else {
        setIsShowLoadingIndicator(false);
        setLabelText(translationString.download_failed);
        auth.loginWithNoOrder(translationString.download_failed, true);
      }
    }

    if (!networkModel.isConnected) {
      setAlertMsg(translationString.no_internet_connection);
    }
  }, [isShowLoadingIndicator, networkModel.isConnected]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={Constants.navStyles.navButton}
            onPress={() => {
              RootNavigation.navigate('JobTransfer');
            }}>
            <Image source={ImageRes.JobTransferIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={Constants.navStyles.navButton}
            onPress={() => {
              RootNavigation.navigate('MarketPlace');
            }}>
            <Image source={ImageRes.TransferIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={Constants.navStyles.navButton}
            onPress={() => {
              RootNavigation.navigate('ScanQr');
            }}>
            <Image source={ScanIcon} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (manifestData.marketDateUpdate) {
        retryButtonOnPressed();
        manifestData.marketDateUpdate = null;
        manifestData.marketDateUpdateLocation = 'PendingJobListScreen'; // to limit delta sync call one time only
      }
    });
    return unsubscribe;
  }, [navigation]);

  return {
    networkModel,
    labelText,
    isShowLoadingIndicator,
    cancelButtonOnPressed,
    retryButtonOnPressed,
    alertMsg,
  };
};
