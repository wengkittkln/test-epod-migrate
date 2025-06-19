/* eslint-disable react-hooks/exhaustive-deps */
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import 'react-native-get-random-values';
import {useDispatch, useSelector} from 'react-redux';
import {v4 as uuidv4} from 'uuid';
import * as ActionTypes from '../../Actions/ActionTypes';
import {createAction} from '../../Actions/CreateActions';
import {createLocationApi} from '../../ApiController/ApiController';
import * as Constants from '../../CommonConfig/Constants';
import {IndexContext} from '../../Context/IndexContext';
import * as VehicleLocationRealmManager from '../../Database/realmManager/VehichleLocationRealmManager';
import {useNetwork} from '../../Hooks/Network/useNetwork';
import {Platform} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import VIForegroundService from '@voximplant/react-native-foreground-service';

const GPS_FETCH_INTERVAL_MS = 1 * 60 * 1000;
const GPS_UPLOAD_INTERVAL_MS = 5 * 60 * 1000;

const trackingSubscribers = new Set();
let watchId = null;
let timerId = null;

export const useLocation = () => {
  const {networkModel} = useNetwork();
  const userModel = useSelector((state) => state.UserReducer);
  const [localLocationList, setLocalLocationList] = useState([]);
  const {manifestData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);
  const dispatch = useDispatch();

  const subscriberIdRef = useRef(uuidv4());

  const setGPSTracking = (enabled) => {
    const id = subscriberIdRef.current;
    const prevCount = trackingSubscribers.size;

    if (enabled) {
      trackingSubscribers.add(id);
      if (prevCount === 0) {
        startTracking();
      }
    } else {
      trackingSubscribers.delete(id);
      if (prevCount === 1) {
        stopTracking();
      }
    }
  };

  const startTracking = () => {
    if (Platform.OS === 'android') {
      if (timerId) return;

      VIForegroundService.getInstance().createNotificationChannel({
        id: 'epod-location',
        name: 'Location Tracking',
        description: 'KOOLPoD background location tracking',
        importance: 2,
        enableVibration: false,
      });

      VIForegroundService.getInstance().startService({
        channelId: 'epod-location',
        id: 144,
        title: 'KOOLPoD',
        text: 'Tracking your location in background',
        icon: 'ic_launcher',
        priority: 'min',
      });

      Geolocation.getCurrentPosition(
        (location) => {
          onGetPositionSuccess(location, GPS_UPLOAD_INTERVAL_MS);
          if (networkModel.isConnected) {
            getLocalLocationData();
          }
        },
        (error) => {
          console.log('[ERROR] Initial location error:', error);
          onGetPositionFailed(error.code);
        },
        {enableHighAccuracy: true},
      );

      timerId = BackgroundTimer.runBackgroundTimer(() => {
        Geolocation.getCurrentPosition(
          (location) => {
            onGetPositionSuccess(location, GPS_UPLOAD_INTERVAL_MS);
            if (networkModel.isConnected) {
              getLocalLocationData();
            }
          },
          (error) => {
            console.log('[ERROR] Periodic location error:', error);
            onGetPositionFailed(error.code);
          },
          {enableHighAccuracy: true},
        );
      }, GPS_FETCH_INTERVAL_MS);
      return;
    }

    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }
    watchId = Geolocation.watchPosition(
      (location) => {
        onGetPositionSuccess(location, GPS_UPLOAD_INTERVAL_MS);
        if (networkModel.isConnected) {
          getLocalLocationData();
        }
      },
      (error) => {
        console.log('[ERROR] Geolocation error:', error);
        onGetPositionFailed(error.code);
      },
      {
        accuracy: {android: 'high', ios: 'best'},
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: GPS_FETCH_INTERVAL_MS,
        fastestInterval: GPS_FETCH_INTERVAL_MS,
        showLocationDialog: true,
        forceRequestLocation: true,
      },
    );
  };

  const stopTracking = () => {
    if (Platform.OS === 'android') {
      if (timerId) {
        BackgroundTimer.stopBackgroundTimer();
        timerId = null;
      }
      VIForegroundService.getInstance().stopService();
    }

    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  const onGetPositionSuccess = async (location, interval) => {
    const currentTimeInMilli = moment().valueOf();
    const nextTimeInMilli = currentTimeInMilli - interval;
    try {
      let newLocationModel = {
        accuracy: location.coords.accuracy || 0,
        altitude: location.coords.altitude || 0,
        speed: location.coords.speed || 0,
        id: Math.floor(Math.random() * Date.now()),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        guid: uuidv4(),
        operateTime: `${currentTimeInMilli}`,
        syncStatus: Constants.SyncStatus.SYNC_PENDING,
        manifestId: manifestData.id,
        operateTimeInt: currentTimeInMilli,
        batteryLevel: await DeviceInfo.getBatteryLevel(),
      };
      const records =
        VehicleLocationRealmManager.queryVehicleDataWithinInterval(
          epodRealm,
          nextTimeInMilli,
        );
      if (records.length === 0) {
        dispatch(createAction(ActionTypes.UPDATE_LOCATION, newLocationModel));
        VehicleLocationRealmManager.insertNewLocation(
          newLocationModel,
          epodRealm,
        );
      }
    } catch (error) {
      console.log('insert location error: ', error);
    }
  };

  const updateSyncStatusLocationList = (locationsList) => {
    locationsList.forEach((item) => {
      const plainItem = JSON.parse(JSON.stringify(item));

      let updateModel = {
        ...plainItem,
        syncStatus: Constants.SyncStatus.SYNC_SUCCESS,
      };
      try {
        VehicleLocationRealmManager.updateVehicleData(updateModel, epodRealm);
      } catch (error) {
        console.log('failed to update location sync status: ', error);
      }
    });
  };

  const callCreateLocationApi = async (locationBodyRequest, locationList) => {
    try {
      await createLocationApi(locationBodyRequest);
      updateSyncStatusLocationList(locationList);
    } catch (error) {
      console.log('callCreateLocationApi error:', error);
    }
  };

  const getLocalLocationData = () => {
    let locationList =
      VehicleLocationRealmManager.queryLocalVehicleData(epodRealm);
    setLocalLocationList(locationList);

    if (locationList && locationList.length > 0) {
      let locationBodyRequest = [];
      const locationModels = [];

      locationList.map((item) => {
        let model = {
          accuracy: item.accuracy,
          altitude: item.altitude,
          speed: item.speed,
          longitude: item.longitude,
          latitude: item.latitude,
          deviceId: DeviceInfo.getUniqueId(),
          userId: userModel.id,
          manifestId: manifestData.id,
          operateTime: moment(item.operateTime, 'x').utc(true),
          guid: item.guid,
          batteryLevel: item.batteryLevel,
        };
        locationModels.push({...model, id: item.id});
        locationBodyRequest.push(model);
      });

      callCreateLocationApi(locationBodyRequest, locationList);
    }
  };

  const onGetPositionFailed = (errorCode) => {
    console.log('[ERROR] Position fetch failed with code:', errorCode);
  };

  useEffect(() => {
    return () => {
      setGPSTracking(false);
    };
  }, []);

  return {setGPSTracking, locationModel: localLocationList};
};
