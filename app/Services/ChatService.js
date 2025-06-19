import * as signalR from '@microsoft/signalr';
import {BASE_URL} from '../ApiController/ApiConfig';
import {Platform} from 'react-native';

let chatConnection = null;
let token = '';
let userId = '';

// Callback handlers
let onReceiveMessage = null;
let onUserJoined = null;
let onUserLeft = null;
let onReceiveUnreadNotification = null;
let onMessagesRead = null;

export const setupChatConnection = async (authToken, user) => {
  // If already connected with same user and token, skip setup
  if (
    chatConnection &&
    chatConnection.state === signalR.HubConnectionState.Connected &&
    userId === user &&
    token === authToken
  ) {
    return;
  }

  // Clean up previous connection if exists
  if (chatConnection) {
    await disconnectChatConnection();
  }

  token = authToken;
  userId = user;

  try {
    chatConnection = new signalR.HubConnectionBuilder()
      .withUrl(BASE_URL + 'chathub', {
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
    chatConnection.onreconnecting((error) => {
      console.log('Chat SignalR Connection lost. Reconnecting...', error);
    });

    chatConnection.onreconnected((connectionId) => {
      console.log('Chat SignalR Reconnected. ConnectionId:', connectionId);
    });

    chatConnection.onclose((error) => {
      console.log(
        'Chat SignalR Connection closed. Will attempt to reconnect...',
        error,
      );
      // Attempt to restart connection after delay
      setTimeout(() => setupChatConnection(token, userId), 5000);
    });

    // Message handlers
    chatConnection.on(
      'ReceiveMessage',
      (
        messageId,
        jobId,
        senderUserId,
        senderName,
        message,
        messageType,
        attachmentUrl,
        timestamp,
      ) => {
        onReceiveMessage &&
          onReceiveMessage(
            messageId,
            jobId,
            senderUserId,
            senderName,
            message,
            messageType,
            attachmentUrl,
            timestamp,
          );
      },
    );

    chatConnection.on('UserJoined', (userId) => {
      onUserJoined && onUserJoined(userId);
    });

    chatConnection.on('UserLeft', (userId) => {
      onUserLeft && onUserLeft(userId);
    });

    chatConnection.on(
      'ReceiveUnreadNotification',
      (jobId, messageId, messageContent, timestamp, senderName) => {
        onReceiveUnreadNotification &&
          onReceiveUnreadNotification(
            jobId,
            messageId,
            messageContent,
            timestamp,
            senderName,
          );
      },
    );

    chatConnection.on('MessagesRead', (jobId, messageIds) => {
      onMessagesRead && onMessagesRead(jobId, messageIds);
    });

    // Start the connection
    await chatConnection.start();
    console.log('Chat SignalR connected');

    // Register user after connection is established
    if (userId) {
      await chatConnection.invoke('RegisterUser', parseInt(userId));
      console.log('Registered user with Chat SignalR:', userId);
    }
  } catch (error) {
    console.error('Chat SignalR Connection Error:', error);
    // Retry connection after delay
    setTimeout(() => setupChatConnection(token, userId), 5000);
  }
};

export const disconnectChatConnection = async () => {
  if (!chatConnection) return;

  try {
    // Stop the connection
    await chatConnection.stop();
    console.log('Chat SignalR connection stopped');
  } catch (error) {
    console.error('Error disconnecting Chat SignalR:', error);
  } finally {
    // Clean up
    chatConnection = null;
    onReceiveMessage = null;
    onUserJoined = null;
    onUserLeft = null;
    onReceiveUnreadNotification = null;
    onMessagesRead = null;
    token = '';
    userId = '';
  }
};

export const joinChatGroup = async (jobId, userId) => {
  if (
    !chatConnection ||
    chatConnection.state !== signalR.HubConnectionState.Connected
  ) {
    console.error('Cannot join chat: Chat SignalR not connected');
    return;
  }

  try {
    await chatConnection.invoke('JoinChat', jobId, parseInt(userId));
    console.log(`Joined chat group for job ${jobId}`);
  } catch (error) {
    console.error('Error joining chat group:', error);
  }
};

export const leaveChatGroup = async (jobId, userId) => {
  if (
    !chatConnection ||
    chatConnection.state !== signalR.HubConnectionState.Connected
  ) {
    console.error('Cannot leave chat: Chat SignalR not connected');
    return;
  }

  try {
    await chatConnection.invoke('LeaveChat', jobId, parseInt(userId));
    console.log(`Left chat group for job ${jobId}`);
  } catch (error) {
    console.error('Error leaving chat group:', error);
  }
};

export const sendChatMessage = async (
  messageId,
  jobId,
  message,
  senderUserId,
  messageType = 0,
  attachmentUrl = null,
) => {
  if (
    !chatConnection ||
    chatConnection.state !== signalR.HubConnectionState.Connected
  ) {
    console.error('Cannot send message: Chat SignalR not connected');
    return false;
  }

  try {
    await chatConnection.invoke(
      'SendMessage',
      messageId,
      jobId,
      message,
      parseInt(senderUserId),
      messageType,
      attachmentUrl,
    );
    console.log(`Message sent to job ${jobId}`);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

export const getChatConnection = () => chatConnection;

export const setOnReceiveMessage = (callback) => {
  onReceiveMessage = callback;
};

export const setOnUserJoined = (callback) => {
  onUserJoined = callback;
};

export const setOnUserLeft = (callback) => {
  onUserLeft = callback;
};

export const setOnReceiveUnreadNotification = (callback) => {
  onReceiveUnreadNotification = callback;
};

export const setOnMessagesRead = (callback) => {
  onMessagesRead = callback;
};
