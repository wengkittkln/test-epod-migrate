import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Constants from '../../CommonConfig/Constants';
import DeviceInfo from 'react-native-device-info';
import {IndexContext} from '../../Context/IndexContext';
import moment from 'moment';
import * as JobRealmManager from '../../Database/realmManager/JobRealmManager';
import BackButton from '../../Assets/image/icon_back_white.png';
import {translationString} from '../../Assets/translation/Translation';
import LoadingModal from './../../Components/LoadingModal';

export default ({route, navigation}) => {
  const {manifestData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);

  let webRef = React.createRef();
  let baseUrl = '';
  let accessToken = route.params.ACCESS_TOKEN;
  let refreshToken = route.params.REFRESH_TOKEN;
  let isRefresh = route.params.isRefresh;

  const [isLoading, setIsLoading] = useState(true);

  const _injectAccessTokenOnLoad = async () => {
    let script = `
          setTimeout(() => {
            window.localStorage.setItem("languageCode", 'en-Us');
            window.localStorage.setItem("adminTimezone", 'UTC+08:00');
            window.localStorage.setItem("refreshAdminToken", '${refreshToken}');
            window.localStorage.setItem("adminDeviceId", '${DeviceInfo.getUniqueId()}');
            window.localStorage.setItem("adminToken", '${accessToken}');
          }, 100);
        `;

    if (Platform.OS === 'ios') {
      script += 'true;';
    }

    webRef.injectJavaScript(script);
  };

  const JSForIOS = () => {
    let script = `
        window.localStorage.setItem("languageCode", 'en-Us');
        window.localStorage.setItem("adminTimezone", 'UTC+08:00');
        window.localStorage.setItem("refreshAdminToken", '${refreshToken}');
        window.localStorage.setItem("adminDeviceId", '${DeviceInfo.getUniqueId()}');
        window.localStorage.setItem("adminToken", '${accessToken}');
      `;

    if (Platform.OS === 'android') {
      script = 'console.log(0);';
    }

    return script;
  };

  const getUrl = () => {
    if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Production) {
      baseUrl = Constants.TRACKING_MAP_URL_PROD;
    } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Uat) {
      baseUrl = Constants.TRACKING_MAP_URL_TRIAL;
    } else if (Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.Stg) {
      baseUrl = Constants.TRACKING_MAP_URL_STG;
    } else if (
      Constants.CURRENT_RELEASE_MODE === Constants.ReleaseMode.PreProd
    ) {
      baseUrl = Constants.TRACKING_MAP_URL_PRE;
    }

    const deliveryDate = moment(manifestData.deliveryDate);
    const job = JobRealmManager.getFirstJob(epodRealm);

    baseUrl += `date=${deliveryDate.date()}%2F${
      deliveryDate.month() + 1
    }%2F${deliveryDate.year()}&manifest=${manifestData.id}&job=${job[0].id}`;

    return baseUrl;
  };

  const hideSpinner = () => {
    setIsLoading(false);
    if (isRefresh) {
      isRefresh = false;
      navigation.pop();
      navigation.navigate('webView', {
        REFRESH_TOKEN: refreshToken,
        ACCESS_TOKEN: accessToken,
        isRefresh,
      });
    }
  };

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

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
      headerTitle: translationString.map,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.baseContainer}>
      <WebView
        ref={(ref) => (webRef = ref)}
        onMessage={(event) => {
          console.log(event);
        }}
        onLoadStart={() => _injectAccessTokenOnLoad()}
        injectedJavaScript={JSForIOS()}
        onLoad={() => hideSpinner()}
        source={{
          uri: getUrl(),
        }}
        startInLoadingState
        useWebKit
        javaScriptEnabled
        domStorageEnabled
      />
      <LoadingModal isShowLoginModal={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'rgb(248, 248, 248)',
  },
  flatlist: {
    flex: 1,
  },
  centerEmptySet: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});
