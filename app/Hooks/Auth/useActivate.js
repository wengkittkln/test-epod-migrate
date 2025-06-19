import React, {useState, useRef, useEffect} from 'react';
import {translationString} from '../../Assets/translation/Translation';
import {TouchableOpacity, Image} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import BackButton from '../../Assets/image/icon_back_white.png';
import {ifAssigned, isDoAssign} from '../../ApiController/ApiController';
import * as QrCodeHelper from '../../Helper/QrCodeHelper';
import * as RootNavigation from '../../rootNavigation';

export const useActivate = (route, navigation) => {
  const cameraRef = useRef(null);
  const [isBarcodeScannerEnabled, setBarcodeScannerEnabled] = useState(true);
  const [isShowLoadingIndicator, setIsShowLoadingIndicator] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const username = route.params.username;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleQrCode = async (qrCode) => {
    //avoid multiple scan
    if (isBarcodeScannerEnabled) {
      setIsShowLoadingIndicator(true);
      setBarcodeScannerEnabled(false);

      if (QrCodeHelper.isNotOrderNum(qrCode)) {
        const type = QrCodeHelper.getType(qrCode);
        switch (type) {
          case Constants.QRType.MANIFEST_QR.toString():
            await callIfAssignedApi(qrCode);
            break;

          default:
            setAlertMsg(translationString.expired_code);
            break;
        }
      } else if (
        QrCodeHelper.getSystem(qrCode) === 'K5' &&
        QrCodeHelper.getType(qrCode) === Constants.QRType.DO_QR
      ) {
        await callIfDoAssignedApi(qrCode);
      } else {
        setAlertMsg(translationString.expired_code);
      }

      setIsShowLoadingIndicator(false);
      setBarcodeScannerEnabled(true);
    }
  };

  const callIfAssignedApi = async (qrCode) => {
    let params = {
      Id: parseInt(QrCodeHelper.getManifestId(qrCode)),
      userName: username,
      CompanyId: parseInt(QrCodeHelper.getCompanyId(qrCode)),
    };

    try {
      const response = await ifAssigned(params);
      RootNavigation.navigate('UserInfo', {
        username: username,
        manifestId: parseInt(QrCodeHelper.getManifestId(qrCode)),
        companyId: parseInt(QrCodeHelper.getCompanyId(qrCode)),
      });
    } catch (err) {
      let errorModel = err.response.data;
      setAlertMsg(errorModel.errorMessage);
    }
  };

  const callIfDoAssignedApi = async () => {
    let params = {
      orderNumber: QrCodeHelper.getData(qrCode, 4),
      username: username,
      partyCode: QrCodeHelper.getCompanyId(qrCode),
    };

    try {
      const response = await isDoAssign(params);

      RootNavigation.navigate('UserInfo', {
        userName: username,
        partyCode: QrCodeHelper.getCompanyId(qrCode),
        orderNumber: QrCodeHelper.getData(qrCode, 4),
      });
    } catch (err) {
      let errorModel = err.response.data;
      setAlertMsg(errorModel.errorMessage);
    }
  };

  useEffect(() => {
    if (alertMsg) {
      setTimeout(() => {
        setAlertMsg('');
      }, 4000);
    }
  }, [alertMsg]);

  useEffect(() => {}, []);

  return {
    alertMsg,
    cameraRef,
    isShowLoadingIndicator,
    handleBack,
    handleQrCode,
  };
};
