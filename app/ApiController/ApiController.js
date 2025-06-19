import apiConfig from './ApiConfig';
import axios from 'axios';
import {Platform} from 'react-native';
import * as Constants from '../CommonConfig/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import * as UrlConstants from '../CommonConfig/UrlConstants';

let header = {
  'Content-Type': 'application/json',
};

let encryptionHeader = {
  'x-amz-server-side-encryption': 'AES256',
  'Content-Type': 'image/jpeg', //'multipart/form-data',
};

let encryptionHeaderXlsx = {
  'x-amz-server-side-encryption': 'AES256',
  'Content-Type':
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', //'multipart/form-data',
};

// ----------------------- Device Module -----------------------
export const regeisterDeviceApi = () => {
  let params = {
    DeviceId: DeviceInfo.getUniqueId(),
    DeviceType: Platform.OS === 'ios' ? 1 : 2,
    RegistrationId: '99999999',
    GuiVersion: DeviceInfo.getVersion(),
  };
  return apiConfig.post('api/v1/device', params, header);
};

// ----------------------- User Module -----------------------

export const userLoginApi = (loginModel, deviceModel) => {
  let params = {
    username: loginModel.username,
    password: loginModel.password,
    device: {
      DeviceId: DeviceInfo.getUniqueId(),
      DeviceType: Platform.OS === 'ios' ? 1 : 2,
      RegistrationId: '99999999',
      GuiVersion: DeviceInfo.getVersion(),
    },
  };
  return apiConfig.post(UrlConstants.URL_ACC + 'login', params, header);
};

export const resetIsRefreshingApiConfig = () => {
  apiConfig.resetIsRefreshing();
};

export const userLogoutApi = (manifestId) => {
  let params = {
    deviceId: DeviceInfo.getUniqueId(),
    manifestId,
  };
  return apiConfig.post(UrlConstants.URL_ACC + 'logout', params, header);
};

export const get2FAQRAndCode = (userId) => {
  const params = {
    userId,
  };
  return apiConfig.post(UrlConstants.URL_ACC + 'Setup2FA', params, header);
};

export const verify2FA = (key, userCode, isUserSetup2FA, userId) => {
  const params = {
    Key: key,
    UserCode: userCode,
    IsFirstTimeSetup2FA: !isUserSetup2FA,
    UserId: userId,
  };

  return apiConfig.post(UrlConstants.URL_ACC + 'Verify2FA', params, header);
};

export const checkIs2FASetup = (userId) => {
  const params = {
    userId,
  };
  return apiConfig.post(
    UrlConstants.URL_ACC + 'CheckIs2FASetup',
    params,
    header,
  );
};

export const checkIsNeedTwoFAVerification = (userId) => {
  const params = {
    type: 'Two Factor Authentication',
    userId,
  };
  return apiConfig.post(
    UrlConstants.URL_ACC + 'CheckLoginTypeDriverApp',
    params,
    header,
  );
};

export const requestSendResetPasswordEmail = (
  email,
  username,
  targetDomain,
  language,
) => {
  const params = {
    Email: email,
    Username: username,
    TargetDomain: targetDomain,
    Language: language,
  };

  return apiConfig.post(
    UrlConstants.URL_ACC + 'RequestResetPasswordEmail',
    params,
    header,
  );
};

export const requestResetPasswordWithPhoneNumber = (
  PhoneNumber,
  Username,
  Method,
  Language,
) => {
  const params = {
    PhoneNumber,
    Username,
    Method,
    Language,
  };

  return apiConfig.post(
    UrlConstants.URL_ACC + 'RequestResetPasswordWithPhoneNumber',
    params,
    header,
  );
};

export const requestNewOTP = (PhoneNumber, Username, Method, Language) => {
  const params = {
    PhoneNumber,
    Username,
    Method,
    Language,
  };

  return apiConfig.post(UrlConstants.URL_ACC + 'RequestNewOTP', params, header);
};

export const resetPasswordWithOTP = (
  PhoneNumber,
  Username,
  OTP,
  Password,
  Method,
  Language,
) => {
  const params = {
    PhoneNumber,
    Username,
    OTP,
    Password,
    Method,
    Language,
  };

  return apiConfig.post(
    UrlConstants.URL_ACC + 'ResetPasswordWithOTP',
    params,
    header,
  );
};

// ----------------------- Data Module -----------------------

export const getNextManifestApi = () => {
  return apiConfig.get(
    UrlConstants.URL_MANIFEST + 'GetNextManifest',
    null,
    header,
  );
};

export const getMasterDataApi = (manifestId) => {
  return apiConfig.get(
    UrlConstants.URL_CUSTOMER + `MasterData?manifestId=${manifestId}`,
    null,
    header,
  );
};

export const getMasterConfigurations = () => {
  return apiConfig.get(
    UrlConstants.URL_CUSTOMER + 'MasterConfigurations',
    null,
    header,
  );
};

export const getDeltaSyncDataApi = (
  manifestId,
  lastSynDate,
  isForcedSequencing,
) => {
  // save LAST_DElTA_SYNC_TIME only after delta sync success
  // to avoid last delta sync time being updated when error occur
  // to prevent data not sync if any new data is updated during error
  // AsyncStorage.setItem(
  //   Constants.LAST_DElTA_SYNC_TIME,
  //   moment().utc().format('YYYY-MM-DD HH:mm:ss'),
  // );
  return apiConfig.get(
    UrlConstants.URL_MANIFEST +
      `lastsync/${manifestId}?lastSyncDate=${lastSynDate}&isForcedSequencing=${isForcedSequencing}`,
    null,
    header,
  );
};

//used to create manifest and return manifest
export const createManifest = (requestBody) => {
  return apiConfig.post(UrlConstants.URL_MANIFEST_CREATE, requestBody, header);
};

// ----------------------- Action Module -----------------------

export const actionSync = (actionList) => {
  return apiConfig.post(UrlConstants.URL_ACTION, actionList, header);
};

export const checkUnsyncedGuidsApi = (guidsToCheck) => {
  // guidsToCheck is expected to be an array of strings (GUIDs)
  return apiConfig.post(
    `${UrlConstants.URL_ACTION}check-unsynced-guids`,
    guidsToCheck,
    header,
  );
};

// ----------------------- Action Module For photo -----------------------

export const uploadFile = (id, filePathList) => {
  return apiConfig.post(
    UrlConstants.URL_FILE + `?id=${id}`,
    filePathList,
    header,
  );
};

//Different Url for upload differenet photo and return void as result
export const uploadPhoto = (urlPath, imagePath) => {
  console.log('uploadPhoto', urlPath);
  console.log('uploadPhoto', imagePath);
  return fetch(urlPath, {
    method: 'PUT',
    headers: encryptionHeader,
    body: {
      uri: imagePath,
      name: imagePath.split('/')[imagePath.split('/').length - 1],
    },
  });
};

//upload action for photo
export const updateAction = (actionId, actionModel) => {
  return apiConfig.put(UrlConstants.URL_ACTION + actionId, actionModel, header);
};

export const updatePlateNo = (
  plateNo,
  driverName,
  driverPhoneNumber,
  ManifestId,
) => {
  let params = {
    PlateNo: plateNo,
    ManifestId: ManifestId,
    driverName,
    driverPhoneNumber,
  };
  return apiConfig.put(
    UrlConstants.URL_JOB + '/UpdatePlateNo/',
    params,
    header,
  );
};

// ----------------------- Job Module-----------------------

export const updateSequence = (jobRequestBody) => {
  return apiConfig.put(UrlConstants.URL_JOB, jobRequestBody, header);
};

// ----------------------- Job Request Module-----------------------

export const requestJob = (jobId, manifestId) => {
  const params = {
    JobId: jobId,
    ManifestId: manifestId,
  };
  return apiConfig.post(UrlConstants.URL_JOB_REQUEST, params, header);
};

export const approveJobRequest = (requestId) => {
  return apiConfig.post(`${UrlConstants.URL_JOB_REQUEST}/${requestId}/approve`);
};

export const rejectJobRequest = (requestId, reason) => {
  return apiConfig.post(`${UrlConstants.URL_JOB_REQUEST}/${requestId}/reject`, {
    reason: reason,
  });
};

export const getPendingJobRequests = (page, limit, search) => {
  let url = `${UrlConstants.URL_JOB_REQUEST}/pending?page=${page}&limit=${limit}`;
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return apiConfig.get(url);
};

export const getSentJobRequests = (page, limit, search) => {
  let url = `${UrlConstants.URL_JOB_REQUEST}/sent?page=${page}&limit=${limit}`;
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return apiConfig.get(url);
};

export const getAvailableJobs = (page, limit, search) => {
  let url = `${UrlConstants.URL_JOB_REQUEST}/available?page=${page}&limit=${limit}`;
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return apiConfig.get(url);
};

export const createLocationApi = (locationList) => {
  return apiConfig.post(UrlConstants.URL_LOCATION, locationList, header);
};

// ----------------------- New Module  -----------------------

export const userRegisterApi = (registerModel) => {
  let params = {
    userName: registerModel.username,
    name: registerModel.name,
    password: registerModel.password,
    phoneNumber: registerModel.phoneNo,
    email: registerModel.email,
    company: registerModel.company,
  };
  return apiConfig.post(UrlConstants.URL_ACC + 'Register', params, header);
};

export const activeUserApi = (activationModal) => {
  let params = {
    userName: activationModal.nameArg,
    CompanyId: activationModal.companyArg,
    PartyCode: activationModal.partyArg,
    device: {
      DeviceId: DeviceInfo.getUniqueId(),
      DeviceType: Platform.OS === 'ios' ? 1 : 2,
      RegistrationId: '99999999',
      GuiVersion: DeviceInfo.getVersion(),
    },
  };
  return apiConfig.post(UrlConstants.URL_ACC + 'ActivateUser', params, header);
};

export const scanManifest = (manifestQR) => {
  return apiConfig.get(
    UrlConstants.URL_MANIFEST_CREATE +
      'ScanManifest/' +
      `?manifestQR=${manifestQR}`,
    null,
    header,
  );
};

export const getSelfSync = (manifestId) => {
  return apiConfig.get(
    UrlConstants.URL_MANIFEST + 'GetManifestById/' + manifestId,
    null,
    header,
  );
};

export const getDoSelfSync = (orderNumber) => {
  return apiConfig.get(
    UrlConstants.URL_MANIFEST + 'GetManifestByOrder/' + orderNumber,
    null,
    header,
  );
};

export const getUserInfo = (params) => {
  return apiConfig.post(UrlConstants.URL_ACC + 'GetUserInfo', params, header);
};

export const grabManifest = (Id, username, CompanyId) => {
  const params = {
    Id: Id,
    userName: username,
    CompanyId: CompanyId,
  };

  return apiConfig.post(
    UrlConstants.URL_MANIFEST + 'GrabManifest',
    params,
    header,
  );
};

export const grabDoManifest = (orderNumber, username, partyCode) => {
  const params = {
    orderNumber: orderNumber,
    username: username,
    partyCode: partyCode,
  };

  return apiConfig.post(
    UrlConstants.URL_MANIFEST + 'GrabDoManifest',
    params,
    header,
  );
};

export const checkDo = (orderNumber, username, partyCode) => {
  const params = {
    orderNumber: orderNumber,
    username: username,
    partyCode: partyCode,
  };
  return apiConfig.post(UrlConstants.URL_MANIFEST + 'CheckDo', params, header);
};

export const ifAssigned = (params) => {
  return apiConfig.post(
    UrlConstants.URL_MANIFEST + 'IfAssigned',
    params,
    header,
  );
};

export const isDoAssign = (params) => {
  return apiConfig.post(
    UrlConstants.URL_MANIFEST + 'IsDoAssigned',
    params,
    header,
  );
};

export const getManifestByContainer = (ContainerId, UserId, ManifestId) => {
  const params = {
    ContainerId: ContainerId,
    UserId: UserId,
    ManifestId: ManifestId,
  };

  return apiConfig.post(
    UrlConstants.URL_MANIFEST + 'getManifeatByContainer',
    params,
    header,
  );
};

export const getContainerJob = (ContainerId, UserId, ManifestId) => {
  const params = {
    ContainerId: ContainerId,
    UserId: UserId,
    ManifestId: ManifestId,
  };

  return apiConfig.post(
    UrlConstants.URL_MANIFEST + 'GetContainerJob',
    params,
    header,
  );
};

//Sample upload Photo api
export const uploadProfilePhotoApi = (imagePath) => {
  const data = new FormData();
  let photoHeader = {
    'Content-Type': 'multipart/form-data',
  };
  data.append('image', {
    uri: imagePath,
    type: 'image/jpeg',
    name: 'image.jpg',
  });

  return apiConfig.post('/Api/Account/Photo', data, photoHeader);
};

export const resetManifest = (manifestId) => {
  return apiConfig.post(
    UrlConstants.URL_MANIFEST + 'resetManifest',
    manifestId.toString(),
    header,
  );
};

// Market Place
export const getUnassignJob = (skip, take, search) => {
  return apiConfig.post(
    UrlConstants.URL_UNASSIGN_JOB,
    {
      take: take,
      skip: skip,
      OrderNumbers: search,
    },
    header,
  );
};

export const assignJob = (manifestId, jobs, selectedGroupId) => {
  return apiConfig.post(UrlConstants.URL_ASSIGN_JOB, {
    manifestId: manifestId,
    jobIds: jobs,
    groupCodeId: selectedGroupId,
  });
};

export const confirmTransferRequest = (model) => {
  return apiConfig.post(
    UrlConstants.URL_JOB_TRANSFER + '/ConfirmTransferRequest',
    model,
  );
};

export const cancelTransferRequest = (id, latitude, longitude) => {
  return apiConfig.get(
    UrlConstants.URL_JOB_TRANSFER +
      `/CancelTransferRequest/${id}?Latitude=${latitude}&Longitude=${longitude}`,
  );
};

export const ReceivedJob = (
  id,
  manifestId,
  isAccept,
  rejectReason,
  receivedQty,
) => {
  return apiConfig.post(
    UrlConstants.URL_JOB_TRANSFER + '/AcceptTransferRequest',
    {
      id,
      manifestId,
      isAccept,
      rejectReason,
      receivedQty,
    },
  );
};

export const GetTransferList = () => {
  return apiConfig.get(UrlConstants.URL_JOB_TRANSFER + '/GetTransferList');
};

export const FetchUsers = (lastUpdatedDate, manifestId, isEmpty) => {
  return apiConfig.get(
    UrlConstants.URL_JOB_TRANSFER +
      `/GetUserList?lastSyncDate=${lastUpdatedDate}&manifestId=${manifestId}&isEmpty=${isEmpty}`,
  );
};
export const uploadDatabaseFile = (filename) => {
  return apiConfig.get(
    UrlConstants.URL_FILE + `RequestExportDBUrl?fileName=${filename}`,
  );
};

export const uploadDatabase = (urlPath, filePath) => {
  return fetch(urlPath, {
    method: 'PUT',
    headers: encryptionHeaderXlsx,
    body: {
      uri: filePath,
      name: filePath.split('/')[filePath.split('/').length - 1],
    },
  });
};

export const fetchRouteSequence = (model) => {
  return apiConfig.post(UrlConstants.URL_GET_JOB_SEQUENCE, model);
};

export const getCompanyAllowedModule = (companyId) => {
  return apiConfig.get(
    UrlConstants.URL_ACC + `getAllowedModules?companyId=${companyId}`,
  );
};

export const resetDbUploadFlag = (manifestId) => {
  return apiConfig.get(
    UrlConstants.URL_MANIFEST + `ResetDbUploadFlag/${manifestId}`,
  );
};

// export const fetchRouteSequence = (model) => {
//   return apiConfig.postV2('api/v1/GoogleAPI/GetJobSequence', model);
// };

export const getAllGroupCode = () => {
  return apiConfig.get(UrlConstants.URL_GROUP + '/GetAllGroup');
};

export const updateJobLatestETA = (model) => {
  const body = {
    job: model,
  };
  return apiConfig.post(UrlConstants.URL_JOB + '/UpdateJobLatestETA', body);
};

// ----------------------- Chat Module -----------------------
export const getChatHistory = (jobId) => {
  return apiConfig.get(`${UrlConstants.URL_JOB}/${jobId}/chat/history`);
};

export const markMessagesAsRead = (jobId, messageIds) => {
  return apiConfig.post(`${UrlConstants.URL_JOB}/${jobId}/chat/markread`, {
    messageIds,
  });
};

export const getJobsUnreadChatCount = (jobIds) => {
  return apiConfig.post(`${UrlConstants.URL_JOB}/chat/jobsunreadcount`, {
    jobIds: jobIds,
  });
};
