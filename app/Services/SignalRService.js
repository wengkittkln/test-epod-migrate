import * as signalR from '@microsoft/signalr';
import {BASE_URL} from '../ApiController/ApiConfig';
import {Platform} from 'react-native';

let connection = null;
let onJobRequestReceived = null;
let onJobRequestApproved = null;
let onJobRequestRejected = null;
let token = '';
let userId = '';

export const setupSignalRConnection = async (authToken, user) => {
  // If already connected with same user and token, skip setup
  if (
    connection &&
    connection.state === signalR.HubConnectionState.Connected &&
    userId === user &&
    token === authToken
  ) {
    return;
  }

  // Clean up previous connection if exists
  if (connection) {
    await disconnectSignalR();
  }

  token = authToken;
  userId = user;

  try {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(BASE_URL + 'jobRequestHub', {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Return the next delay in milliseconds
          if (retryContext.elapsedMilliseconds < 60000) {
            // If we've been reconnecting for less than 60 seconds, retry every 2-5 seconds
            return Math.random() * 3000 + 2000;
          } else {
            // After 60 seconds, retry every 10-15 seconds
            return Math.random() * 5000 + 10000;
          }
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Connection event handlers
    connection.onreconnecting((error) => {
      console.log('SignalR Connection lost. Reconnecting...', error);
    });

    connection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected. ConnectionId:', connectionId);
      // Rejoin group after reconnection
      if (userId) {
        connection.invoke('JoinGroup', userId.toString()).catch((err) => {
          console.error('Failed to rejoin group:', err);
        });
      }
    });

    connection.onclose((error) => {
      console.log(
        'SignalR Connection closed. Will attempt to reconnect...',
        error,
      );
      // Attempt to restart connection after delay
      setTimeout(() => setupSignalRConnection(token, userId), 5000);
    });

    // Message handlers
    connection.on('ReceiveJobRequest', (request) => {
      onJobRequestReceived && onJobRequestReceived(request);
    });

    connection.on('JobRequestApproved', (request) => {
      onJobRequestApproved && onJobRequestApproved(request);
    });

    connection.on('JobRequestRejected', (request) => {
      onJobRequestRejected && onJobRequestRejected(request);
    });

    // Start the connection
    await connection.start();

    // Join user group after connection is established
    if (userId) {
      await connection.invoke('JoinGroup', userId.toString());
      console.log('SignalR connected and joined group:', userId);
    }
  } catch (error) {
    console.error('SignalR Connection Error:', error);
    // Retry connection after delay
    setTimeout(() => setupSignalRConnection(token, userId), 5000);
  }
};

export const getSignalRConnection = () => {
  return connection;
};

export const setOnJobRequestReceived = (callback) => {
  onJobRequestReceived = callback;
};

export const setOnJobRequestApproved = (callback) => {
  onJobRequestApproved = callback;
};

export const setOnJobRequestRejected = (callback) => {
  onJobRequestRejected = callback;
};

export const disconnectSignalR = async () => {
  if (!connection) return;

  try {
    // Leave group first if connected and userId exists
    if (connection.state === signalR.HubConnectionState.Connected && userId) {
      await connection.invoke('LeaveGroup', userId.toString());
      console.log('Left SignalR group:', userId);
    }

    // Stop the connection
    await connection.stop();
    console.log('SignalR connection stopped');
  } catch (error) {
    console.error('Error disconnecting SignalR:', error);
  } finally {
    // Clean up
    connection = null;
    onJobRequestReceived = null;
    onJobRequestApproved = null;
    onJobRequestRejected = null;
    token = '';
    userId = '';
  }
};
