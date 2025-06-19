import React, {useCallback, useState, useContext} from 'react';
import {Alert} from 'react-native';
import {
  approveJobRequest,
  getAvailableJobs,
  getPendingJobRequests,
  getSentJobRequests,
  rejectJobRequest,
  requestJob,
} from '../../ApiController/ApiController';
import SignalRService from '../../Services/SignalRService';
import {translationString} from '../../Assets/translation/Translation';
import {IndexContext} from '../../Context/IndexContext';

export const useJobRequest = (userId) => {
  const {manifestData} = useContext(IndexContext);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [availablePage, setAvailablePage] = useState(1);
  const [pendingHasMore, setPendingHasMore] = useState(true);
  const [sentHasMore, setSentHasMore] = useState(true);
  const [availableHasMore, setAvailableHasMore] = useState(true);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [sentTotal, setSentTotal] = useState(0);
  const [availableTotal, setAvailableTotal] = useState(0);
  const limit = 5;

  const setupSignalRConnection = useCallback(async () => {
    SignalRService.onJobRequestReceived = (request) => {
      console.log('Job request received:', JSON.stringify(request));
      setCurrentRequest(request);
      setShowRequestModal(true);
    };

    SignalRService.onJobRequestApproved = (request) => {
      Alert.alert(
        translationString.job_request_received_title,
        translationString.job_request_received_message.replace(
          '{0}',
          request.jobId,
        ),
      );
    };

    SignalRService.onJobRequestRejected = (request) => {
      Alert.alert(
        translationString.job_request_rejected_title,
        translationString.job_request_rejected_message.replace(
          '{0}',
          request.jobId,
        ),
      );
    };

    await SignalRService.startConnection('', userId);
  }, [userId]);

  const handleRequestJob = useCallback(
    async (jobId, setShowModal) => {
      try {
        await requestJob(jobId, manifestData.id);
        Alert.alert(
          translationString.success,
          translationString.job_request_sent_success,
        );
        setAvailableJobs([]);
        if (setShowModal) {
          setShowModal(false);
        }
      } catch (error) {
        Alert.alert(
          translationString.error,
          translationString.job_request_sent_error,
        );
      }
    },
    [manifestData.id, fetchAvailableJobs],
  );

  const handleApproveRequest = useCallback(
    async (request) => {
      try {
        await approveJobRequest(request.id);
        setShowRequestModal(false);
        Alert.alert(
          translationString.success,
          translationString.job_request_approved_success,
        );
        await fetchPendingJobRequests(1);
      } catch (error) {
        Alert.alert(
          translationString.error,
          translationString.job_request_approved_error,
        );
      }
    },
    [currentRequest],
  );

  const handleRejectRequest = useCallback(
    async (request, reason) => {
      try {
        await rejectJobRequest(request.id, reason);
        setShowRequestModal(false);
        Alert.alert(
          translationString.success,
          translationString.job_request_rejected_success,
        );
        await fetchPendingJobRequests(1);
      } catch (error) {
        Alert.alert(
          translationString.error,
          translationString.job_request_rejected_error,
        );
      }
    },
    [currentRequest],
  );

  const fetchPendingJobRequests = useCallback(async (page = 1, search = '') => {
    try {
      const response = await getPendingJobRequests(page, limit, search);
      const newData = response.data.items;
      const total = response.data.total;
      setPendingRequests((prevRequests) => {
        const updatedRequests =
          page === 1 ? newData : [...prevRequests, ...newData];
        setPendingHasMore(newData.length > 0 && updatedRequests.length < total);
        return updatedRequests;
      });
      setPendingTotal(total);
      setPendingPage(page);
      return response;
    } catch (error) {
      console.error('Failed to fetch pending job requests:', error);
      Alert.alert(
        translationString.error,
        error.message || 'Failed to fetch pending job requests',
      );
      return [];
    }
  }, []);

  const fetchSentJobRequests = useCallback(async (page = 1, search = '') => {
    try {
      const requests = await getSentJobRequests(page, limit, search);
      const newData = requests.data.items;
      const total = requests.data.total;
      setSentRequests((prevRequests) => {
        const updatedRequests =
          page === 1 ? newData : [...prevRequests, ...newData];
        setSentHasMore(newData.length > 0 && updatedRequests.length < total);
        return updatedRequests;
      });
      setSentTotal(total);
      setSentPage(page);
      return requests;
    } catch (error) {
      console.error('Failed to fetch sent job requests:', error);
      Alert.alert(
        translationString.error,
        translationString.job_request_fetch_sent_error,
      );
      return [];
    }
  }, []);

  const fetchAvailableJobs = useCallback(async (page = 1, search = '') => {
    try {
      const jobs = await getAvailableJobs(page, limit, search);
      const newData = jobs.data.items;
      const total = jobs.data.total;
      setAvailableJobs((prevJobs) => {
        const updatedJobs = page === 1 ? newData : [...prevJobs, ...newData];
        setAvailableHasMore(newData.length > 0 && updatedJobs.length < total);
        return updatedJobs;
      });
      setAvailableTotal(total);
      setAvailablePage(page);
      return jobs;
    } catch (error) {
      console.error('Failed to fetch available jobs:', error);
      Alert.alert(
        translationString.error,
        translationString.job_request_fetch_available_error,
      );
      return [];
    }
  }, []);

  return {
    currentRequest,
    showRequestModal,
    setShowRequestModal,
    setupSignalRConnection,
    handleRequestJob,
    handleApproveRequest,
    handleRejectRequest,
    fetchPendingJobRequests,
    fetchSentJobRequests,
    fetchAvailableJobs,
    pendingRequests,
    sentRequests,
    availableJobs,
    pendingHasMore,
    sentHasMore,
    availableHasMore,
  };
};
