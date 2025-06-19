import React, {useEffect, useState, useLayoutEffect, useRef} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import * as Constants from '../../../CommonConfig/Constants';
import {translationString} from '../../../Assets/translation/Translation';
import BackButton from '../../../Assets/image/icon_back_white.png';
import {useSelector, useDispatch} from 'react-redux';
import * as JobRealmManager from '../../../Database/realmManager/JobRealmManager';
import * as ManifestRealmManager from '../../../Database/realmManager/ManifestRealmManager';
import * as OrderRealmManager from '../../../Database/realmManager/OrderRealmManager';
import * as GeneralHelper from '../../../Helper/GeneralHelper';
import {IndexContext} from '../../../Context/IndexContext';
import * as JobHelper from '../../../Helper/JobHelper';
import {createAction} from '../../../Actions/CreateActions';
import * as ActionType from '../../../Actions/ActionTypes';
import * as ApiController from './../../../ApiController/ApiController';
import moment, {min} from 'moment';

export const useReorder = (route, navigation) => {
  const [progress, setProgress] = useState(0.0);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef();
  const [datalist, setDataList] = useState([]);
  const {epodRealm, manifestData, EpodRealmHelper} =
    React.useContext(IndexContext);
  const networkModel = useSelector((state) => state.NetworkReducer);
  const dispatch = useDispatch();
  const locationModel = useSelector((state) => state.LocationReducer);
  const [isShowConfirmDialog, setIsShowConfirmDialog] = useState(false);
  const batchSize = 25;
  const routeName = route?.name;
  const jobIdParam = route?.params?.jobId;

  useEffect(() => {
    getJobList();
  }, []);

  const getJobList = async () => {
    setIsLoading(true);

    let tempDataList = [];
    let localPendingJobList =
      JobRealmManager.getAllJobByStatusSortByDescStatusAscSeqAscTime(
        epodRealm,
        Constants.JobStatus.IN_PROGRESS,
      );

    localPendingJobList.map((item, index) => {
      let jobModel = GeneralHelper.convertRealmObjectToJSON(item);
      tempDataList.push(jobModel);
    });

    let requestObjects = {};
    let batch = 1;

    let isFirst = true;
    let firstJob;

    if (jobIdParam) {
      const fromIndex = tempDataList.findIndex((x) => x.id === jobIdParam);
      firstJob = tempDataList[fromIndex];

      console.log('Before', tempDataList[0].id);
      tempDataList.splice(fromIndex, 1);
      //tempDataList.splice(0, 0, firstJob);
      console.log('After', tempDataList[0].id);
      console.log('District', firstJob ? firstJob.district : '');

      const firstDistrict = firstJob ? firstJob.district : '';
      const groupByDistrict = tempDataList.filter(
        (x) => x.district === firstDistrict,
      );

      tempDataList = tempDataList.filter((x) => x.district !== firstDistrict);
      tempDataList.sort((a, b) => {
        let fa = a.district?.toLowerCase(),
          fb = b.district?.toLowerCase();

        if (fa < fb) {
          return -1;
        }
        if (fa > fb) {
          return 1;
        }
        return 0;
      });

      tempDataList.unshift(...groupByDistrict);
    }

    if (routeName !== 'RouteSequence') {
      for (let i = 0; i < tempDataList.length; i++) {
        tempDataList[i].sequence = i + 1;
      }
      setDataList(tempDataList);
      setIsLoading(false);
      return;
    } else if (
      !firstJob ||
      (firstJob && (!firstJob.latitude || !firstJob.longitude))
    ) {
      for (let i = 0; i < tempDataList.length; i++) {
        tempDataList[i].sequence = 0;
      }
      setDataList(tempDataList);
      setIsLoading(false);
      return;
    } else {
      let noGeoList = [];
      let withGeoList = [];

      for (var o of tempDataList) {
        if (o.latitude && o.longitude) {
          withGeoList.push(o);
        } else {
          o.sequence = 0;
          noGeoList.push(o);
        }
      }

      tempDataList = withGeoList;

      const totalBatch = Math.ceil(tempDataList.length / batchSize);
      let isSuccess = false;

      for (let i = 0; i < tempDataList.length; i += batchSize) {
        const chunk = tempDataList.slice(i, i + batchSize);

        let originCoordinates = '';
        let jobId = 0;
        let orderId = 0;

        if (isFirst) {
          originCoordinates =
            // locationModel.latitude + ',' + locationModel.longitude;
            originCoordinates = firstJob.latitude + ',' + firstJob.longitude;
        } else {
          const previousRecord =
            requestObjects.order_Detail[requestObjects.order_Detail.length - 1];

          originCoordinates = previousRecord.coordinates;
          jobId = previousRecord.job_id;
          orderId = previousRecord.order_id;
        }

        requestObjects = {
          manifest_id: manifestData.id,
          batch: batch,
          number_per_batch: batchSize,
          is_optimize: true,
          is_last: totalBatch === batch,
          order_Detail: [
            {
              job_id: jobId,
              order_id: orderId,
              coordinates: originCoordinates,
            },
          ],
        };

        for (var c of chunk) {
          const order = OrderRealmManager.getOrderByOrderNumber(
            c.orderList,
            epodRealm,
          );

          const orderIdb = order[0] !== undefined ? order[0].id : 0;

          if (orderIdb === 0) {
            return;
          }

          const objDetail = {
            job_id: c.id,
            order_id: orderId,
            coordinates: c.latitude + ',' + c.longitude,
          };
          requestObjects.order_Detail.push(objDetail);
        }

        //GetJobSequence API will replace this to the distination set at the company profile.
        if (totalBatch === batch) {
          const objDetail = {
            job_id: 0,
            order_id: 0,
            coordinates: locationModel.latitude + ',' + locationModel.longitude,
            //coordinates: '22.3578109,114.1298151',
          };
          requestObjects.order_Detail.push(objDetail);
        }

        await ApiController.fetchRouteSequence(requestObjects)
          .then((response) => {
            console.log('response', response.data);
            if (response.status === 200) {
              const data = response.data.details;

              let isFirstItem = true;
              for (var x of data) {
                console.log(x.job_Id, x.sequence);
                if (!isFirstItem) {
                  var temp = tempDataList.find((a) => a.id == x.job_Id);

                  if (temp !== null && temp !== undefined) {
                    temp.sequence = x.sequence - 1;
                    temp.duration = x.duration;
                  }
                }
                isFirstItem = false;
                isSuccess = true;
              }
            } else {
            }
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            isFirst = false;
            batch++;
            setProgress(Math.ceil((totalBatch / batch) * 100));
            console.log('finally');
          });
      }

      if (isSuccess) {
        tempDataList = tempDataList.sort((a, b) => a.sequence - b.sequence);
        tempDataList.splice(0, 0, firstJob);

        for (let i = 0; i < tempDataList.length; i++) {
          tempDataList[i].sequence = i + 1;
        }
      } else {
        tempDataList.splice(0, 0, firstJob);

        for (let a = 0; a < tempDataList.length; a++) {
          tempDataList[a].sequence = 0;
        }
      }

      tempDataList.splice(0, 0, ...noGeoList);
      setDataList(tempDataList);
      setIsLoading(false);
    }
  };

  const dragEnd = (from, to, data) => {
    for (let i = 0; i < data.length; i++) {
      data[i].sequence = i + 1;
      data[i].latestETA = '';
    }

    setDataList([]);
    setDataList(data);
  };

  const cancelButtonOnPressed = () => {
    navigation.goBack();
  };

  const confirmButtonOnPressed = async () => {
    if (networkModel.isConnected) {
      let tempDataList = datalist;
      let isSuccess = true;
      let noGeoList = [];
      let withGeoList = [];

      if (routeName === 'RouteSequence') {
        setIsLoading(true);
        let isFirst = true;
        let requestObjects = {};
        let batch = 1;
        const totalBatch = Math.ceil(tempDataList.length / batch);

        let totalDuration = 0;

        for (var o of tempDataList) {
          if (o.latitude && o.longitude) {
            withGeoList.push(o);
          } else {
            //o.sequence = 0;
            o.duration = -99;
            noGeoList.push(o);
          }
        }

        tempDataList = withGeoList;

        for (let i = 0; i < tempDataList.length; i += batchSize) {
          const chunk = tempDataList.slice(i, i + batchSize);
          if (!isSuccess) {
            break;
          }

          let originCoordinates = '';
          let jobId = 0;
          let orderId = 0;

          if (isFirst) {
            originCoordinates =
              locationModel.latitude + ',' + locationModel.longitude;
            //originCoordinates = '22.3578109,114.1298151';
          } else {
            const previousRecord =
              requestObjects.order_Detail[
                requestObjects.order_Detail.length - 1
              ];

            originCoordinates = previousRecord.coordinates;
            jobId = previousRecord.job_id;
            orderId = previousRecord.order_id;
          }

          requestObjects = {
            manifest_id: manifestData.id,
            batch: batch,
            number_per_batch: batchSize,
            is_optimize: false,
            is_last: false,
            order_Detail: [
              {
                job_id: jobId,
                order_id: orderId,
                coordinates: originCoordinates,
              },
            ],
          };

          for (var c of chunk) {
            const order = OrderRealmManager.getOrderByOrderNumber(
              c.orderList,
              epodRealm,
            );

            const orderIdb = order[0] !== undefined ? order[0].id : 0;

            if (orderIdb === 0) {
              return;
            }

            const objDetail = {
              job_id: c.id,
              order_id: orderId,
              coordinates: c.latitude + ',' + c.longitude,
            };
            requestObjects.order_Detail.push(objDetail);
          }

          await ApiController.fetchRouteSequence(requestObjects)
            .then((response) => {
              console.log('response', response.data);
              if (response.status === 200) {
                const data = response.data.details;
                let lastDuration = 0;
                let isFirstItem = true;
                for (var x of data) {
                  if (!isFirstItem) {
                    var temp = tempDataList.find((a) => a.id == x.job_Id);
                    if (temp !== null && temp !== undefined) {
                      //temp.sequence = x.sequence - 1;
                      temp.duration = lastDuration;
                      totalDuration += temp.duration;

                      temp.latestETA = moment
                        .utc()
                        .add(totalDuration, 'seconds')
                        .format('YYYY-MM-DD HH:mm:ss');

                      lastDuration = x.duration;

                      JobRealmManager.updateLatestETA(
                        epodRealm,
                        x.job_Id,
                        temp.latestETA?.replace(' ', 'T') + 'Z',
                      );
                    }
                  } else {
                    lastDuration = x.duration;
                  }
                  isFirstItem = false;
                }
              } else {
                isSuccess = false;
              }
            })
            .catch((error) => {
              console.log('catch error', error);
              isSuccess = false;
            })
            .finally(() => {
              isFirst = false;
              batch++;
              setProgress(Math.ceil((totalBatch / batch) * 100));
              console.log('finally');
            });
        }
        // tempDataList = tempDataList.sort((a, b) => a.sequence - b.sequence);
      } else {
        isSuccess = false;
      }

      let jobSequenceList = [];
      tempDataList.splice(0, 0, ...noGeoList);
      tempDataList = tempDataList.sort((a, b) => a.sequence - b.sequence);

      tempDataList.map((item, i) => {
        let model = {
          jobId: item.id,
          sequence: isSuccess ? i + 1 : 0,
          duration: isSuccess ? item.duration : -99,
        };
        jobSequenceList.push(model);
      });

      JobHelper.callUpdateSequenceApi(jobSequenceList, epodRealm)
        .then(async () => {
          if (routeName === 'RouteSequence') {
            let manifests =
              ManifestRealmManager.queryAllManifestData(epodRealm);
            if (manifests && manifests.length) {
              let manifestInfo = GeneralHelper.convertRealmObjectToJSON(
                manifests[0],
              );

              if (manifestInfo) {
                manifestInfo.sequencedCount = manifestInfo.sequencedCount + 1;

                if (
                  manifestInfo.sequencedCount >= manifestInfo.sequenceLimit &&
                  manifestInfo.sequenceLimit > 0
                ) {
                  manifestInfo.sequencedStatus = 1;
                }

                ManifestRealmManager.updateManifestData(
                  manifestInfo,
                  epodRealm,
                );
                await EpodRealmHelper.updateManifestData(manifestInfo);
              }
            }
            if (!isSuccess) {
              JobRealmManager.resetLatestETA(epodRealm);
            }
          }
          for (let i = 0; i < jobSequenceList.length; i++) {
            const x = jobSequenceList[i];
            JobRealmManager.updateSequenceByJobId(
              x.jobId,
              x.sequence,
              epodRealm,
            );
          }

          let payload = {
            isRefresh: true,
          };
          dispatch(createAction(ActionType.SET_JOBLIST_REFRESH, payload));
          if (navigation.canGoBack()) {
            navigation.popToTop();
          }
        })
        .catch((err) => {
          console.log(err);
          ref.current.show('fail to reorder', 500);
          JobRealmManager.resetLatestETA(epodRealm);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      ref.current.show(translationString.no_internet_connection, 500);
    }
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
      headerTitle:
        routeName === 'RouteSequence'
          ? translationString.route_sequencing
          : routeName === 'PreRouteSequence'
          ? translationString.select_first_order
          : translationString.resort,
    });
  }, [navigation, routeName]);

  return {
    ref,
    datalist,
    progress,
    isLoading,
    isShowConfirmDialog,
    routeName,
    setDataList,
    cancelButtonOnPressed,
    confirmButtonOnPressed,
    dragEnd,
    setIsShowConfirmDialog,
  };
};
