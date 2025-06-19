import React, {FC, useEffect, useState} from 'react';
import {useContext, createContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {createAction} from '../Actions/CreateActions';
import {Job} from '../Model/Job';
import {JobItemList} from '../Model/JobTransfer';
import {User} from '../Model/User';
import store from '../Reducers';
import * as ActionType from '../Actions/ActionTypes';

export type JobContextData = {
  init(): void;
  onSelected(job: JobItemList): void;
  setId(id: number): void;
  setCompressString(compressString: string): void;
  setParcelQty(parcelQty: number): void;
  onRemove(id: number): void;
  getSelected(id: number): boolean;
  setTransferReason(reason: string): void;
  setStatus(status: number): void;
  setPreManifestId(status: number): void;
  setIsRefresh(status: number): void;
  setIsSynced(status: number): void;
  setFromUser(status: string): void;
  setDriver(driver: string): void;
  setSelectedJobList(jobList: JobItemList[]): void;
  refresh(): void;
  setRejectReason(reason: string): void;
  id: number;
  selectedJobList: JobItemList[];
  compressString: string;
  parcelQty: number;
  transferReason: string;
  status: number;
  fromUser: string;
  preManifestId: number;
  isRefresh: number;
  isSynced: number;
  driver: string;
  rejectReason: string;
};

export const JobTransferJobContext =
  createContext<JobContextData | undefined>(undefined);
export const JobTransferProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [id, setId] = useState(0);
  const [selectedJobList, setSelectedJobList] = useState([] as JobItemList[]);
  const [compressString, setCompressString] = useState('');
  const [parcelQty, setParcelQty] = useState(0);
  const [transferReason, setTransferReason] = useState('');
  const [status, setStatus] = useState(0);
  const [requestedBy, setRequestedBy] = useState('');
  const [preManifestId, setPreManifestId] = useState(0);
  const [isRefresh, setIsRefresh] = useState(0);
  const [isSynced, setIsSynced] = useState(0);
  const [driver, setDriver] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const dispatch = useDispatch();

  const init = () => {
    console.log('init');
    setSelectedJobList([]);
    setCompressString('');
    setParcelQty(0);
    setTransferReason('');
    setStatus(0);
    setDriver('');
    setPreManifestId(0);
    setRequestedBy('');
    setId(0);
    setRejectReason('');

    const jobNumPayload = {
      selected: '',
    };

    dispatch(
      createAction(ActionType.SET_JOB_TRANSFER_SELECTED_ITEMS, jobNumPayload),
    );
  };

  const refresh = () => {
    setSelectedJobList(selectedJobList);
  };

  const onSelected = (job: JobItemList) => {
    const jobList = selectedJobList;
    jobList.push(job);

    setSelectedJobList(jobList);
  };

  const onRemove = (id: number) => {
    const filteredJobList = selectedJobList.filter(
      (job: JobItemList) => job.id !== id,
    );

    setSelectedJobList(filteredJobList);
  };

  const getSelected = (id: number): boolean => {
    return (
      selectedJobList.find((item) => item.id === id) !== (null || undefined)
    );
  };

  useEffect(() => {}, [selectedJobList]);

  return (
    <JobTransferJobContext.Provider
      value={{
        selectedJobList,
        compressString,
        parcelQty,
        transferReason,
        status,
        fromUser: requestedBy,
        preManifestId,
        isRefresh,
        isSynced,
        id,
        driver,
        rejectReason,
        init,
        onRemove,
        onSelected,
        getSelected,
        setCompressString,
        setParcelQty,
        setTransferReason,
        setStatus,
        setFromUser: setRequestedBy,
        setPreManifestId,
        setIsRefresh,
        setSelectedJobList,
        setIsSynced,
        refresh,
        setId,
        setDriver,
        setRejectReason,
      }}>
      {children}
    </JobTransferJobContext.Provider>
  );
};

export const useJobTransferProvider = () => {
  const context = useContext(JobTransferJobContext);
  if (!context) {
    throw new Error(
      'useJobTransferProvider must be used within an JobTransferProvider',
    );
  }
  return context;
};
