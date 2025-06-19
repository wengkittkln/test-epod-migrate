import React from 'react';
import {DrawerActions} from '@react-navigation/native';
import * as Toast from '../Components/Toast/ToastMessage';
import {translationString} from '../Assets/translation/Translation';
import {Platform, PermissionsAndroid} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import store from '../Reducers';
import {User} from '../Model/User';
import moment from 'moment';
import * as RNFS from 'react-native-fs';
import {
  exportToJson,
  getSchemaNameByIndex,
} from '../Database/realmManager/ExportRealmManager';
import {IndexContext} from '../Context/IndexContext';
import XLSX from 'xlsx';
import * as Constants from '../CommonConfig/Constants';
import * as ApiController from '../ApiController/ApiController';

export const UploadDatabaseService = () => {
  const userModel = useSelector<typeof store>(
    (state) => state.UserReducer,
  ) as User;

  const {epodRealm} = React.useContext(IndexContext);

  const uploadDatabase = async (isManual: boolean, manifestId: number) => {
    if (!isManual && manifestId == 0) return;

    Toast.ToastMessage({
      text1: translationString.start_upload_db,
      text2: translationString.uploading,
    });

    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    const userName = userModel.username;

    const fileName =
      '/' + userName + '_' + moment().format('YYYY_MM_DD_hh_mm_ss') + '.xlsx';

    const filePath = RNFS.DocumentDirectoryPath + fileName;

    try {
      const jsonList = exportToJson(epodRealm);

      const workbook = XLSX.utils.book_new();

      for (var i = 0; i < jsonList.length; i++) {
        const schemaName = getSchemaNameByIndex(i);

        if (schemaName === Constants.CUSTOMER_SCHEMA) {
          jsonList[i].forEach((xx) => {
            Object.keys(xx).forEach(function (key) {
              if (key === 'tnC') {
                xx[key] = '';
              }
            });
          });
        }

        const worksheet = XLSX.utils.json_to_sheet(jsonList[i]);
        XLSX.utils.book_append_sheet(workbook, worksheet, schemaName);
      }

      console.log('Generating XLSX');
      const base64 = XLSX.write(workbook, {type: 'base64'});

      RNFS.writeFile(filePath, base64, 'base64')
        .then((success) => {
          console.log('FILE WRITTEN!');
        })
        .catch((err) => {
          console.log(err.message);
        });

      const signedUrlsResponse = await ApiController.uploadDatabaseFile(
        fileName.replace('/', ''),
      );

      const resultModel = signedUrlsResponse.data; // response for signed urls list

      if (resultModel) {
        const s3Response = await ApiController.uploadDatabase(
          resultModel,
          'file://' + filePath,
        );

        if (
          s3Response === null ||
          s3Response === undefined ||
          (s3Response != null && s3Response.status !== 200)
        ) {
          Toast.ToastMessageError({
            text1: translationString.upload_db_fail,
          });
        }
      }
      deleteFile(filePath);
      console.log('Deleted temp databaase xlsx');
      if (isManual) {
        Toast.ToastMessage({
          text1: translationString.upload_db_success,
        });
      } else {
        await ApiController.resetDbUploadFlag(manifestId);
      }
    } catch (error) {
      Toast.ToastMessageError({
        text1: translationString.upload_db_fail,
      });
      console.log(error);
      deleteFile(filePath);
    }
  };

  const hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  };

  const deleteFile = (uri) => {
    RNFS.unlink(uri)
      .then(() => {
        console.log('FILE DELETED');
      })
      // `unlink` will throw an error, if the item to unlink does not exist
      .catch((err) => {
        console.log(err.message);
      });
  };

  return {uploadDatabase};
};
