import axios from 'axios';
import * as Constants from '../CommonConfig/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => {
  let baseUrl =
    'https://k1hcxkuia1.execute-api.ap-southeast-1.amazonaws.com/stag/';
  if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Production) {
    baseUrl = 'https://epod-api.hk.kln.com/prod/';
  } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Uat) {
    baseUrl = 'https://epod-api-trial.hk.kln.com/trialT/';
    // baseUrl = 'http://172.27.8.125:4238/';
  } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Stg) {
    baseUrl = 'https://epod-api.hk.kln.com/stgT/';
  } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.PreProd) {
    baseUrl = 'https://epod-api.hk.kln.com/preprod/';
  }

  return baseUrl;
};

const getV2BaseUrl = () => {
  let baseUrl = 'http://172.27.8.146:4238/';
  if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Production) {
    baseUrl = 'http://172.27.8.146:4238/';
  } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Uat) {
    baseUrl = 'http://172.27.8.146:4238/';
  } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Stg) {
    baseUrl = 'http://172.27.8.146:4238/';
  }

  return baseUrl;
};

export const getAppDownloadLink = (platform) => {
  const isIOS = platform === 'ios';

  if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Uat) {
    return isIOS
      ? 'https://epod-trial.hk.kln.com/app/index_trial.html'
      : 'https://epod-trial.hk.kln.com/app/android_trial';
  } else if (
    Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Production
  ) {
    return isIOS
      ? 'https://epod.hk.kln.com/app/index.html'
      : 'https://epod.hk.kln.com/app/android';
  } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.PreProd) {
    return isIOS
      ? 'https://epod-preprod.hk.kln.com/app/index.html'
      : 'https://epod-preprod.hk.kln.com/app/android';
  }
};

export const BASE_URL = getBaseUrl();
const V2_URL = getV2BaseUrl();

// const BASE_URL = 'https://1ef83a93b9e3.ngrok.io/';

export const axiosApiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Cache-Control': 'no-cache',
    'User-Agent': 'PostmanRuntime/7.26.8',
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
  },
});

export const fullUrlFrom = (endpoint) => {
  const fullUrl = BASE_URL + endpoint;
  return fullUrl;
};

export const fullUrlFromV2 = (endpoint) => {
  const fullUrl = V2_URL + endpoint;
  return fullUrl;
};

//remove cycle warning
export const refreshTokenApi = () => {
  AsyncStorage.getItem(Constants.REFRESH_TOKEN).then((token) => {});

  return apiConfig.post('api/v1/account/refresh', null, {
    'Content-Type': 'application/json',
  });
};

axiosApiInstance.interceptors.request.use(
  async (config) => {
    if (config.url.includes('refresh')) {
      return AsyncStorage.getItem(Constants.REFRESH_TOKEN).then((token) => {
        return AsyncStorage.getItem(Constants.LANGUAGE).then((language) => {
          let languageCode = 'zh-HK';
          if (language) {
            const languageModel = JSON.parse(language);
            languageCode = languageModel.acceptLanguage;
          }

          if (token) {
            config.headers.Authorization = 'Bearer ' + token;
          }
          config.headers['Content-Type'] = 'application/json';
          config.headers['Accept-Language'] = languageCode;
          return config;
        });
      });
    } else {
      return AsyncStorage.getItem(Constants.ACCESS_TOKEN).then((token) => {
        return AsyncStorage.getItem(Constants.LANGUAGE).then((language) => {
          let languageCode = 'zh-HK';
          if (language) {
            const languageModel = JSON.parse(language);
            languageCode = languageModel.acceptLanguage;
          }
          // login api not require token
          if (token && !config.url.includes('login')) {
            config.headers.Authorization = 'Bearer ' + token;
          }
          config.headers['Content-Type'] = 'application/json';
          config.headers['Accept-Language'] = languageCode;
          return config;
        });
      });
    }
  },
  (error) => {
    Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = '') => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log(error.data);
    console.log(error.status);
    const originalRequest = error.config;
    if (
      originalRequest &&
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('refresh') &&
      !originalRequest.url.includes('login')
    ) {
      // queue the api (cater multi API call in 1 time)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then((authToken) => {
            originalRequest.headers.Authorization = `Bearer ${authToken}`;
            return axiosApiInstance.request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      return new Promise((resolve, reject) => {
        // call refresh token await refreshTokenApi()
        // need to handle catch case for refresh token
        refreshTokenApi()
          .then((result) => {
            isRefreshing = false;
            AsyncStorage.setItem(
              Constants.ACCESS_TOKEN,
              result.data.auth_token,
            );
            AsyncStorage.setItem(
              Constants.REFRESH_TOKEN,
              result.data.refresh_token,
            );
            axiosApiInstance.defaults.headers.common.Authorization =
              'Bearer ' + result.data.auth_token;
            processQueue(null, result.data.auth_token);
            resolve(axiosApiInstance.request(originalRequest));
          })
          .catch((err) => {
            //direct user to login screen
            processQueue(error);
            err.refreshErrorMsg = Constants.REFRESH_TOKEN_FAILED;
            reject(err);
          });
      });
    } else if (originalRequest.url.includes('refresh')) {
      //direct user to login screen
      isRefreshing = false;
      processQueue(error);
      error.refreshErrorMsg = Constants.REFRESH_TOKEN_FAILED;
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

const fetchUrl = (method, endpoint, params = {}, headers = {}) => {
  if (method === 'get') {
    return axiosApiInstance({
      method: method,
      url: fullUrlFrom(endpoint),
      headers,
    });
  }
  return axiosApiInstance({
    method,
    data: params,
    url: fullUrlFrom(endpoint),
    headers,
  });
};

const fetchUrlV2 = (method, endpoint, params = {}, headers = {}) => {
  if (method === 'get') {
    return axiosApiInstance({
      method: method,
      url: fullUrlFromV2(endpoint),
      headers,
    });
  }
  return axiosApiInstance({
    method,
    data: params,
    url: fullUrlFromV2(endpoint),
    headers,
  });
};

const apiConfig = {
  get(endpoint, params, headers) {
    return fetchUrl('get', endpoint, params, headers);
  },
  post(endpoint, params, headers) {
    return fetchUrl('post', endpoint, params, headers);
  },
  put(endpoint, params, headers) {
    return fetchUrl('put', endpoint, params, headers);
  },
  patch(endpoint, params, headers) {
    return fetchUrl('patch', endpoint, params, headers);
  },
  delete(endpoint, params, headers) {
    return fetchUrl('delete', endpoint, params, headers);
  },

  getV2(endpoint, params, headers) {
    return fetchUrlV2('get', endpoint, params, headers);
  },
  postV2(endpoint, params, headers) {
    return fetchUrlV2('post', endpoint, params, headers);
  },
  putV2(endpoint, params, headers) {
    return fetchUrlV2('put', endpoint, params, headers);
  },
  patchV2(endpoint, params, headers) {
    return fetchUrlV2('patch', endpoint, params, headers);
  },
  deleteV2(endpoint, params, headers) {
    return fetchUrlV2('delete', endpoint, params, headers);
  },
  resetIsRefreshing() {
    isRefreshing = false;
  },
};

export default apiConfig;
