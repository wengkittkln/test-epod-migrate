import React, {useEffect, useState, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {translationString} from '../../Assets/translation/Translation';
import {IndexContext} from '../../Context/IndexContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {JobTransferParamsList} from '../../NavigationStacks/JobTransferStack';
import {JobItemList} from '../../Model/JobTransfer';
import {useJobTransferProvider} from '../../Provider/JobTransferProvider';
import * as JobTransferRealmManager from './../../Database/realmManager/JobTransferRealmManager';
import {JobTransfer} from '../../Model/DatabaseModel/JobTransfer';
import moment from 'moment';
import {JobTransferStatus} from './../../CommonConfig/Constants';
import store from '../../Reducers';
import {User} from '../../Model/User';
import * as ApiController from '../../ApiController/ApiController';
import {Users} from '../../Model/DatabaseModel/Users';
import * as UsersRealmManager from '../../Database/realmManager/UsersRealmManager';

//: StackNavigationProp<ParamListBase, 'JobTransfer'>,
export const useJobTransfer = (
  route: RouteProp<JobTransferParamsList, 'JobTransfer'>,
  navigation: StackNavigationProp<JobTransferParamsList, 'JobTransfer'>,
) => {
  const {epodRealm, EpodRealmHelper, manifestData} =
    React.useContext(IndexContext);
  const [requestedList, setRequestList] = useState<JobTransfer[]>([]);
  const [acceptedList, setAcceptedList] = useState<JobTransfer[]>([]);
  const jobTransferProvider = useJobTransferProvider();
  const [isLoading, setLoading] = useState(false);

  const [index, setIndex] = React.useState(0);
  const [routes, setRoutes] = React.useState([
    {key: 'accepted', title: 'accepted'},
    {key: 'requested', title: 'requested'},
  ]);

  const userModel = useSelector<typeof store>(
    (state) => state.UserReducer,
  ) as User;

  const getList = async () => {
    setLoading(true);

    let accessCount = 0;
    let requestCount = 0;
    await JobTransferRealmManager.getAllJobTransfer(epodRealm)
      .then((y) => {
        setRequestList([]);
        setAcceptedList([]);
        if (y !== undefined) {
          y.forEach((x) => {
            if (x.createdBy && Number(x.createdBy) === userModel.id) {
              requestCount++;
              setRequestList((y) => [...y, x]);
            } else {
              accessCount++;
              setAcceptedList((y) => [...y, x]);
            }
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });

    setRoutes([
      {key: 'accepted', title: 'accept' + '(' + accessCount + ')'},
      {key: 'requested', title: 'request' + '(' + requestCount + ')'},
    ]);
  };

  const addRequest = () => {
    jobTransferProvider.init();
    navigation.navigate('JobTransferJobList');
  };

  const getJobCount = (item: JobTransfer): number => {
    const jobDetails = item.jobDetails?.split('|');

    if (jobDetails) return jobDetails.length;
    else return 0;
  };

  const formatDate = (date?: string): string => {
    if (date === undefined || date === '') return '';
    const d = new Date(date);
    return moment(d).format('YYYY-MM-DD HH:mm');
  };

  const getStatusColor = (syncStatus = 0): string => {
    switch (syncStatus) {
      case JobTransferStatus.PENDING:
        return '#ababab';
      case JobTransferStatus.COMPLETED:
        return '#45be2a';
      case JobTransferStatus.REJECTED:
        return '#cc0027';
      case JobTransferStatus.CANCELLED:
        return '#da7dcf';
      default:
        return 'transparent';
    }
  };

  const toDetail = (item: JobTransfer) => {
    jobTransferProvider.setId(item.id!);
    jobTransferProvider.setTransferReason(item.transferReason!);
    jobTransferProvider.setStatus(item.status!);
    jobTransferProvider.setFromUser(item.createdBy!.toString());
    jobTransferProvider.setParcelQty(item.transferedParcelQuantity);
    jobTransferProvider.setDriver(item.toDriver!);
    jobTransferProvider.setRejectReason(item.rejectReason ?? '');

    jobTransferProvider.setSelectedJobList([]);

    console.log('item.createdByName!', item);
    const splitedJobDetail = item.jobDetails!.split('|');
    let jobList: JobItemList[] = [];
    splitedJobDetail?.forEach((x: string) => {
      const splitedResult = x.split(',');
      if (splitedResult.length >= 2) {
        const selectedItem: JobItemList = {
          id: Number(x.split(',')[0]),
          trackingList: x.split(',')[1],
          consignee: '',
          destination: '',
          totalQuantity: 0,
          jobType: 0,
          codAmount: 0,
          isSelected: true,
        };
        jobList.push(selectedItem);
      }
    });

    jobTransferProvider.setSelectedJobList(jobList);
    navigation.navigate('JobTransferDetail', {id: item.id});
  };

  const getUserList = () => {
    let isEmptyList = false;
    let lastUpdatedDate: any;

    let userList: Users[] = UsersRealmManager.selectAllUsers(epodRealm, 0);
    if (userList && userList.length > 0) {
      userList.forEach((x) => {
        const dateB = moment(x.lastUpdatedDate).format('YYYY-MM-DD hh:mm:ss');
        if (!lastUpdatedDate) {
          lastUpdatedDate = dateB;
        } else {
          if (moment(dateB).isAfter(lastUpdatedDate)) {
            lastUpdatedDate = dateB;
          }
        }
      });
    }

    if (!lastUpdatedDate) isEmptyList = true;

    ApiController.FetchUsers(
      moment(lastUpdatedDate).format('YYYY-MM-DD hh:mm:ss'),
      manifestData.id ?? 0,
      isEmptyList,
    )
      .then((response) => {
        const data: Users[] = response.data;
        for (var x of data) {
          const isExist = UsersRealmManager.selectUserById(epodRealm, x.id);
          if (!isExist) {
            UsersRealmManager.insertNewData(x, epodRealm);
          } else {
            UsersRealmManager.updateUser(epodRealm, x, x.id);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getTransferRequestListWhenNoOrder = () => {
    if (!manifestData?.id) {
      setLoading(true);
      ApiController.GetTransferList()
        .then((response) => {
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
        })
        .finally(() => {
          getList();
          setLoading(false);
        });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getList();
    }, []),
  );

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [epodRealm]);

  useEffect(() => {
    getTransferRequestListWhenNoOrder();
    getList();
    getUserList();
  }, [route.params]);

  return {
    requestedList,
    acceptedList,
    routes,
    index,
    isLoading,
    addRequest,
    setIndex,
    formatDate,
    getJobCount,
    toDetail,
    getStatusColor,
  };
};
