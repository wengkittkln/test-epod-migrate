import {StackNavigationProp} from '@react-navigation/stack';
import {useEffect, useState} from 'react';
import {JobTransferParamsList} from '../../../NavigationStacks/JobTransferStack';
import {useJobTransferProvider} from '../../../Provider/JobTransferProvider';
import * as ReasonRealmManager from '../../../Database/realmManager/ReasonRealmManager';
import * as Constants from '../../../CommonConfig/Constants';
import {IndexContext} from '../../../Context/IndexContext';
import React from 'react';
import * as GeneralHelper from '../../../Helper/GeneralHelper';
import {Reason} from '../../../Model/DatabaseModel/Reason';
import {useSelector} from 'react-redux';
import store from '../../../Reducers';
import {User} from '../../../Model/User';
import {
  ToastMessage,
  ToastMessageError,
} from '../../../Components/Toast/ToastMessage';
import {translationString} from '../../../Assets/translation/Translation';

export const useJobTransferAdd_Bak = (
  navigation: StackNavigationProp<JobTransferParamsList, 'JobTransferAdd'>,
) => {
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);

  const [selectedJobCount, setSelectedJobCount] = useState(0);
  const [openReasonDropdown, setOpenReasonDropdown] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [reasons, setReasons] = useState<dropdownItem[]>([]);
  const [parcelQty, setParcelQty] = useState('');

  const jobTransferProvider = useJobTransferProvider();

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
    if (parcelQty === undefined || parcelQty === '') {
      ToastMessageError(
        translationString.job_transfers.enter_parcel_quantity_error,
      );
      return;
    } else if (selectedReason === undefined || selectedReason === '') {
      ToastMessageError(translationString.job_transfers.select_reason_error);
      return;
    } else if (jobTransferProvider.selectedJobList.length === 0) {
      ToastMessageError(translationString.job_transfers.select_job_error);
      return;
    }

    jobTransferProvider.setFromUser(userModel.username);
    jobTransferProvider.setParcelQty(Number(parcelQty));
    jobTransferProvider.setTransferReason(selectedReason.split('|')[1]);
    navigation.navigate('JobTransferDetail');
  };

  useEffect(() => {
    const selectedList = jobTransferProvider.selectedJobList;

    setSelectedJobCount(selectedList.length);
    getJobTransferReasonList();
  }, []);

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [epodRealm]);

  return {
    openReasonDropdown,
    selectedReason,
    reasons,
    parcelQty,
    selectedJobCount,
    setOpenReasonDropdown,
    setSelectedReason,
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
