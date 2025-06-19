import {StackNavigationProp} from '@react-navigation/stack';
import {useEffect, useState} from 'react';
import {JobTransferParamsList} from '../../NavigationStacks/JobTransferStack';
import {useJobTransferProvider} from '../../Provider/JobTransferProvider';
import * as ReasonRealmManager from '../../Database/realmManager/ReasonRealmManager';
import * as Constants from '../../CommonConfig/Constants';
import {IndexContext} from '../../Context/IndexContext';
import React from 'react';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {Reason} from '../../Model/DatabaseModel/Reason';
import {useSelector, useDispatch} from 'react-redux';
import store from '../../Reducers';
import {User} from '../../Model/User';
import {
  ToastMessage,
  ToastMessageError,
} from '../../Components/Toast/ToastMessage';
import {translationString} from '../../Assets/translation/Translation';
import * as UsersRealmManager from '../../Database/realmManager/UsersRealmManager';
import {Users} from '../../Model/DatabaseModel/Users';
import {RouteProp} from '@react-navigation/native';
import {createAction} from './../../Actions/CreateActions';
import * as ActionType from './../../Actions/ActionTypes';

export const useJobTransferAdd = (
  route: RouteProp<JobTransferParamsList, 'JobTransferAdd'>,
  navigation: StackNavigationProp<JobTransferParamsList, 'JobTransferAdd'>,
) => {
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);

  const [selectedJobCount, setSelectedJobCount] = useState(0);
  const [openReasonDropdown, setOpenReasonDropdown] = useState(false);
  const [openDriverDropdown, setOpenDriverDropdown] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [parcelQty, setParcelQty] = useState('');
  const [driverList, setDriverList] = useState<dropdownItem[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [reasons, setReasons] = useState<dropdownItem[]>([]);
  const jobTransferProvider = useJobTransferProvider();
  const dispatch = useDispatch();

  const onParcelQtyChange = (value: string) => {
    setParcelQty(value);
  };

  const userModel = useSelector<typeof store>(
    (state) => state.UserReducer,
  ) as User;

  const getJobTransferReasonList = async () => {
    const reasonRealmList =
      await ReasonRealmManager.getAllReasonByReasonTypeWithoutCustomer(
        Constants.ReasonType.JOB_TRANSFER_REASON,
        epodRealm,
      );

    const reasonList: dropdownItem[] = [];

    reasonRealmList.map((item: any) => {
      const result = GeneralHelper.convertRealmObjectToJSON(item) as Reason;
      const isDuplicate = reasonList.some((y) => {
        return y.label === result.description;
      });

      if (!isDuplicate) {
        reasonList.push({
          label: result.description!,
          value: result.id!.toString() + '|' + result.description!,
        });
      }
    });

    setReasons(reasonList);
  };

  const selectJob = () => {
    navigation.navigate('JobTransferJobList');
  };

  const summary = () => {
    if (jobTransferProvider.selectedJobList.length === 0) {
      ToastMessageError({
        text1: translationString.job_transfers.select_job_error,
      });
      return;
    } else if (parcelQty === undefined || parcelQty === '') {
      ToastMessageError({
        text1: translationString.job_transfers.enter_parcel_quantity_error,
      });
      return;
    } else if (!selectedReason) {
      ToastMessageError({
        text1: translationString.job_transfers.select_reason_error,
      });
      return;
    } else if (!selectedDriver) {
      ToastMessageError({
        text1: translationString.job_transfers.pleaseSelectDriver,
      });
      return;
    }

    jobTransferProvider.setFromUser(userModel.username);
    jobTransferProvider.setParcelQty(Number(parcelQty));
    jobTransferProvider.setStatus(-1);
    jobTransferProvider.setTransferReason(selectedReason);
    jobTransferProvider.setDriver(selectedDriver);

    let statusDispatch = {
      status: -1,
    };

    dispatch(createAction(ActionType.SET_JOB_TRANSFER_STATUS, statusDispatch));

    navigation.navigate('JobTransferDetail');
  };

  const getUserList = () => {
    let userList: Users[] = UsersRealmManager.selectAllUsers(
      epodRealm,
      userModel.id,
    );

    let array: dropdownItem[] = [];

    for (var x of userList) {
      if (x.id) {
        let object: dropdownItem = {
          label: x.name!,
          value:
            x.id.toString() + '|' + (x.displayName ? x.displayName : x.name!),
        };
        array.push(object);
      }
    }
    setDriverList(array);
  };

  useEffect(() => {
    const selectedList = jobTransferProvider.selectedJobList;
    setSelectedJobCount(selectedList.length);
    getJobTransferReasonList();
    getUserList();
  }, []);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [epodRealm]);

  return {
    openReasonDropdown,
    openDriverDropdown,
    selectedReason,
    parcelQty,
    selectedJobCount,
    driverList,
    selectedDriver,
    reasons,
    setOpenReasonDropdown,
    setOpenDriverDropdown,
    setSelectedReason,
    setSelectedDriver,
    setDriverList,
    setReasons,
    onParcelQtyChange,
    selectJob,
    summary,
  };
};

export interface dropdownItem {
  label: string;
  value: string;
}
