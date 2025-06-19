import {Alert} from 'react-native';
import {name as appName} from '../../app.json';
import moment from 'moment';
import * as Constants from '../CommonConfig/Constants';
import jwt_decode from 'jwt-decode';
import * as JobHelper from './JobHelper';
import * as JobRealmManager from '../Database/realmManager/JobRealmManager';
import * as JobBinRealmManager from '../Database/realmManager/JobBinRealmManager';
import * as CustomerRealmManager from '../Database/realmManager/CustomerRealmManager';
import * as RootNavigation from '../rootNavigation';
import {translationString} from '../Assets/translation/Translation';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const encrypt = async (text) => {
  const ivKeyByte = CryptoJS.enc.Latin1.parse(Constants.IV_KEY);

  const saltKeyByte = CryptoJS.enc.Latin1.parse(Constants.AES_SALT);
  const secretPhase = CryptoJS.PBKDF2(Constants.SECRET_PHASE, saltKeyByte, {
    keySize: 256 / 32,
    iterations: 1324,
  });

  // replace 'text' with the correct data
  const encrypted = CryptoJS.AES.encrypt(text, secretPhase, {
    iv: ivKeyByte,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const finalEncryptedValue = encrypted.ciphertext.toString(
    CryptoJS.enc.Base64,
  );
  return finalEncryptedValue;
};

export const decrypt = (text) => {
  const ivKeyByte = CryptoJS.enc.Latin1.parse(Constants.IV_KEY);

  const saltKeyByte = CryptoJS.enc.Latin1.parse(Constants.AES_SALT);
  const secretPhase = CryptoJS.PBKDF2(Constants.SECRET_PHASE, saltKeyByte, {
    keySize: 256 / 32,
    iterations: 1324,
  });

  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(text),
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, secretPhase, {
    iv: ivKeyByte,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const finalDecryptedValue = decrypted.toString(CryptoJS.enc.Utf8);
  return finalDecryptedValue;
};

export const toUTF8Array = (str) => {
  let utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
  }
  return utf8;
};

export const Utf8ArrayToStr = (array) => {
  var out, i, len, c;
  var char2, char3;

  out = '';
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0),
        );
        break;
    }
  }

  return out;
};

export const getHeader = () => {
  return appName + '|';
};

export const isNotOrderNum = (qrCode) => {
  //epod|type|userId|companyId|bluetoothname|time
  return qrCode.includes(getHeader());
};

export const generateCode = (bluetoothName) => {
  //epod|type|userId|companyId|bluetoothname|time
  return AsyncStorage.getItem(Constants.ACCESS_TOKEN).then((token) => {
    const div = '|';
    const user = getJWTDecodedUser(token);

    let companyId = '0';
    let userId = '0';
    if (user) {
      companyId = user.companyid.toString();
      userId = user.id.toString();
    }
    // const date = getJobTransferCache(context)?.jtStartTime;
    const date = moment().format();
    const text =
      Constants.QRType.JOB_TRANSFER.toString() +
      div +
      userId +
      div +
      companyId +
      div +
      bluetoothName +
      div +
      date;
    //ePOD|hsdghjsahcdvhjcvdsGYUKJBL
    return encrypt(text).then((encrytedText) => {
      const qrCodeValue = getHeader() + encrytedText;
      return qrCodeValue;
    });
  });
};

export const getData = (qrCode, position) => {
  //epod|type|userId|companyId|bluetoothname|time
  const div = '|';
  const array = qrCode.split(div);
  return array[position];
};

export const getBluetoothName = (qrCode) => {
  //epod|type|userId|companyId|bluetoothname|time
  return getData(qrCode, Constants.QR_POSITION.BLUETOOTH_NAME);
};

export const getCompanyId = (qrCode) => {
  //epod|type|userId|companyId|bluetoothname|time
  return getData(qrCode, Constants.QR_POSITION.COMPANY_ID);
};

export const getUserIdByQr = (qrCode) => {
  //epod|type|userId|companyId|bluetoothname|time
  return getData(qrCode, Constants.QR_POSITION.MANIFEST_OR_USER_ID);
};

export const getManifestId = (qrCode) => {
  //epod|type|manifestId|companyId
  return getData(qrCode, Constants.QR_POSITION.MANIFEST_OR_USER_ID);
};

export const getType = (qrCode) => {
  //epod|type|manifestId|companyId
  return getData(qrCode, Constants.QR_POSITION.TYPE);
};

export const getSystem = (qrCode) => {
  //epod|type|manifestId|companyId
  return getData(qrCode, Constants.QR_POSITION.APP_NAME);
};

export const getMyCompanyId = (auth_token) => {
  //epod|type|userId|companyId|bluetoothname|time
  return getJWTDecodedUser(auth_token).companyid;
};

export const isSameCompanyId = (qrCode) => {
  //epod|type|userId|companyId|bluetoothname|time
  return getMyCompanyId().equals(getCompanyId(qrCode));
};

export const getJWTDecodedUser = (auth_token) => {
  return jwt_decode(auth_token);
};

export const getJwtUserId = (auth_token) => {
  //epod|type|userId|companyId|bluetoothname|time
  return getJWTDecodedUser(auth_token).id;
};

export const isSameUserId = (qrCode) => {
  //epod|type|userId|companyId|bluetoothname|time

  return AsyncStorage.getItem(Constants.ACCESS_TOKEN).then((auth_token) => {
    return getJwtUserId(auth_token) === getUserIdByQr(qrCode);
  });
};

// ------------ Search Job ------------
export const searchJob = async (qrCode, realm, resetScanFlag) => {
  try {
    let joblist = await JobRealmManager.searchSingleJobByTrackingNo(
      realm,
      qrCode,
    );

    if (joblist && joblist.length > 0) {
      const item = joblist[0];
      handleJobActionAccordingStatus(item);
    } else {
      await searchJobWithRegex(qrCode, realm, resetScanFlag);
    }
  } catch (e) {
    console.log(e);
    // alert(
    //   translationString.formatString(translationString.search_fail, qrCode),
    // );

    return e;
  }
};

const handleJobActionAccordingStatus = async (item) => {
  if (
    item.status === Constants.JobStatus.COMPLETED ||
    item.status === Constants.JobStatus.FAILED
  ) {
    const step = await JobHelper.getStepCode(
      item.customer,
      item.currentStepCode,
      item.jobType,
    );
    RootNavigation.navigate('JobDetail', {
      job: item,
      consigneeName: JobHelper.getConsignee(item, false),
      trackNumModel: JobHelper.getTrackingNumberOrCount(item),
      requestTime: JobHelper.getPeriod(item),
      step: step,
    });
  } else {
    JobHelper.gotoDetailScreen(item);
  }

  // Toast.makeText(this, R.string.search_success, Toast.LENGTH_SHORT).show()
};

export const searchJobWithRegex = async (qrCode, realm, resetScanFlag) => {
  const customerList = await CustomerRealmManager.queryAllCustomerData(realm);
  let found = false;
  await customerList.forEach(async (customer, index) => {
    if (customer.regexPatternValue && customer.regexPatternValue.length > 0) {
      const regex = new RegExp(customer.regexPatternValue, 'gi');
      const matchList = regex.exec(qrCode);
      if (matchList && matchList.length > 0) {
        await matchList.forEach(async (result) => {
          if (result.length > 0) {
            const job = await JobRealmManager.searchSingleJobByOrder(
              realm,
              result,
            );

            if (job) {
              found = true;
              await handleJobActionAccordingStatus(job);
            }
          }
        });
      }
    }
  });
  if (!found) {
    Alert.alert(
      '',
      translationString.formatString(translationString.search_fail, qrCode),
      [
        {
          text: 'Ok',
          onPress: () => {
            resetScanFlag();
          },
        },
      ],
      {cancelable: false},
    );
  }
  // alert(
  //   translationString.formatString(translationString.search_fail, qrCode),
  // );
};

// ------------ Search Job ------------

// Search JobBin
export const searchJobBin = async (qrCode, realm) => {
  try {
    let jobBin = await JobBinRealmManager.getJobBinByBin(realm, qrCode);

    return jobBin;
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const insertSampleJobBin = async (realm) => {
  try {
    await JobBinRealmManager.insertSampleItem(realm);
  } catch (e) {
    console.log(e);
    return e;
  }
};
