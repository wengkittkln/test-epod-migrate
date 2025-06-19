import React, {createContext, useState, useEffect, useCallback} from 'react';
import * as signalR from '@microsoft/signalr';
import {
  setupSignalRConnection,
  getSignalRConnection,
  setOnJobRequestReceived,
  setOnJobRequestApproved,
  setOnJobRequestRejected,
  disconnectSignalR,
} from '../Services/SignalRService';
import {
  setupChatConnection,
  getChatConnection,
  disconnectChatConnection,
  setOnReceiveUnreadNotification,
} from '../Services/ChatService';
import JobRequestNotification from '../Components/JobRequestNotification/JobRequestNotification';
import * as RootNavigation from '../rootNavigation';
import {navigationRef} from '../rootNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Constants from '../CommonConfig/Constants';
import {
  ToastMessage,
  ToastMessageError,
} from '../Components/Toast/ToastMessage';
import {translationString} from '../Assets/translation/Translation';
import ConnectionStateDot from '../Components/ConnectionStateDot';

export const AppContext = createContext(null);

export const AppProvider = ({children}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [onJobApprovedCallback, setOnJobApprovedCallback] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected'); // 'connected', 'connecting', 'disconnected'
  const [chatConnectionState, setChatConnectionState] =
    useState('disconnected');
  const [userModel, setUserModel] = useState(null);
  const [fetchUnreadCountsCallback, setFetchUnreadCountsCallback] =
    useState(null);

  const initializeSignalR = useCallback(async () => {
    try {
      const [token, userModelStr] = await Promise.all([
        AsyncStorage.getItem(Constants.ACCESS_TOKEN),
        AsyncStorage.getItem(Constants.USER_MODEL),
      ]);

      if (!token || !userModelStr) {
        setConnectionState('disconnected');
        setChatConnectionState('disconnected');
        console.log('No token or user found, skipping SignalR initialization');
        return;
      }

      const user = JSON.parse(userModelStr);
      setUserModel(user);
      const currentConnection = getSignalRConnection();
      const currentChatConnection = getChatConnection();

      // Initialize job request hub
      if (
        !currentConnection ||
        currentConnection.state === signalR.HubConnectionState.Disconnected
      ) {
        setConnectionState('connecting');
        console.log('Initializing JobRequest SignalR connection');
        await disconnectSignalR(); // Clean up any existing connection
        await setupSignalRConnection(token, user.id);

        // Set up message handlers
        setOnJobRequestReceived((request) => {
          setCurrentRequest(request);
          setShowNotification(true);
        });

        setOnJobRequestApproved((request) => {
          ToastMessage({
            text1: translationString.jobRequestApprovedText1,
            text2: translationString.formatString(
              translationString.jobRequestApprovedText2,
              request.jobId,
            ),
            duration: 3000,
            position: 'top',
          });
          onJobApprovedCallback?.();
        });

        setOnJobRequestRejected((request) => {
          ToastMessageError({
            text1: translationString.jobRequestRejectedText1,
            text2: translationString.formatString(
              translationString.jobRequestRejectedText2,
              request.jobId,
            ),
            duration: 3000,
            position: 'top',
          });
        });

        const connection = getSignalRConnection();
        if (connection) {
          connection.onreconnecting(() => setConnectionState('connecting'));
          connection.onreconnected(() => setConnectionState('connected'));
          connection.onclose(() => setConnectionState('disconnected'));
          if (connection.state === signalR.HubConnectionState.Connected) {
            setConnectionState('connected');
          }
        }
      }

      // Initialize chat hub
      if (
        !currentChatConnection ||
        currentChatConnection.state === signalR.HubConnectionState.Disconnected
      ) {
        setChatConnectionState('connecting');
        console.log('Initializing Chat SignalR connection');
        await disconnectChatConnection();
        await setupChatConnection(token, user.id);

        setOnReceiveUnreadNotification(
          (jobId, messageId, messageContent, timestamp, senderName) => {
            const currentRouteName =
              navigationRef.current?.getCurrentRoute()?.name;

            const currentRouteParams =
              navigationRef.current?.getCurrentRoute()?.params;
            const currentJobId = currentRouteParams?.jobId;

            const isViewingThisJobChat =
              currentRouteName === 'Chat' &&
              parseInt(currentJobId) === parseInt(jobId);

            if (!isViewingThisJobChat) {
              ToastMessage({
                text1: `${translationString.jobId} #${jobId}${
                  senderName ? ` - ${senderName}` : ''
                }`,
                text2:
                  messageContent.length > 50
                    ? messageContent.substring(0, 50) + '...'
                    : messageContent,
                duration: 3000,
                position: 'top',
              });
            }

            if (fetchUnreadCountsCallback) {
              console.log(
                'Triggering fetchUnreadCounts from notification handler',
              );
              fetchUnreadCountsCallback([jobId]);
            }
          },
        );

        const chatConnection = getChatConnection();
        if (chatConnection) {
          chatConnection.onreconnecting(() =>
            setChatConnectionState('connecting'),
          );
          chatConnection.onreconnected(() =>
            setChatConnectionState('connected'),
          );
          chatConnection.onclose(() => setChatConnectionState('disconnected'));
          if (chatConnection.state === signalR.HubConnectionState.Connected) {
            setChatConnectionState('connected');
          }
        }
      }
    } catch (error) {
      setConnectionState('disconnected');
      setChatConnectionState('disconnected');
      console.error('SignalR initialization error:', error);
      // Retry after delay
      setTimeout(initializeSignalR, 10000);
    }
  }, [onJobApprovedCallback]);

  // Initialize on mount and clean up on unmount
  useEffect(() => {
    initializeSignalR();

    return () => {
      disconnectSignalR();
      disconnectChatConnection();
    };
  }, [initializeSignalR]);

  // Health check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Check job request connection
      const connection = getSignalRConnection();
      if (
        !connection ||
        connection.state === signalR.HubConnectionState.Disconnected
      ) {
        console.log(
          'JobRequest SignalR health check: Connection down, reconnecting...',
        );
        initializeSignalR();
      }

      // Check chat connection
      const chatConnection = getChatConnection();
      if (
        !chatConnection ||
        chatConnection.state === signalR.HubConnectionState.Disconnected
      ) {
        console.log(
          'Chat SignalR health check: Connection down, reconnecting...',
        );
        initializeSignalR();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleViewRequest = () => {
    setShowNotification(false);
    RootNavigation.navigate('JobRequest');
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
    setCurrentRequest(null);
  };

  return (
    <AppContext.Provider
      value={{
        initializeSignalR,
        setOnJobApprovedCallback,
        connectionState,
        chatConnectionState,
        userModel,
        setFetchUnreadCountsCallback,
      }}>
      {children}
      <JobRequestNotification
        visible={showNotification}
        request={currentRequest}
        onViewRequest={handleViewRequest}
        onDismiss={handleDismissNotification}
      />
    </AppContext.Provider>
  );
};
