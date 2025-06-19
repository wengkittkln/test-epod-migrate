import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';
import Svg, {Path} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {v4 as uuid} from 'uuid';
import {AppContext} from '../../Context/AppContext';
import {ChatMessageType} from '../../Model/ChatMessage';
import * as ChatService from '../../Services/ChatService';
import * as ChatApi from '../../ApiController/ApiController';

const ChatScreen = ({route, navigation}) => {
  const {jobId} = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessageIds, setUnreadMessageIds] = useState([]);
  const flatListRef = useRef(null);
  const {userModel} = useContext(AppContext);

  // Utility function to sort messages by timestamp and remove duplicates
  const sortMessagesByTimestamp = (messagesArray) => {
    // Remove duplicates by message ID (keeping the last occurrence)
    const uniqueMessages = messagesArray.reduce((acc, current) => {
      const existingIndex = acc.findIndex((item) => item.id === current.id);
      if (existingIndex >= 0) {
        // Replace existing message with current one (might have updated properties)
        acc[existingIndex] = current;
      } else {
        // Add new unique message
        acc.push(current);
      }
      return acc;
    }, []);

    // Sort by timestamp
    return uniqueMessages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
  };

  useEffect(() => {
    // Set the header title with the job ID
    navigation.setOptions({
      headerTitle: `${translationString.chat} - ${translationString.job} #${jobId}`,
    });
  }, [navigation, jobId]);

  // Initialize chat connection and load messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);

        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem(Constants.ACCESS_TOKEN);
        const userModelStr = await AsyncStorage.getItem(Constants.USER_MODEL);
        const user = JSON.parse(userModelStr);

        if (!token || !user) {
          Alert.alert('Error', 'You need to be logged in to use chat');
          setIsLoading(false);
          return;
        }

        // Setup chat connection
        await ChatService.setupChatConnection(token, user.id);

        // Join the chat group for this job
        await ChatService.joinChatGroup(jobId, user.id);

        // Load chat history
        const response = await ChatApi.getChatHistory(jobId);
        if (response && response.data) {
          const chatMessages = response.data.map((msg) => ({
            id: msg.id,
            text: msg.messageContent,
            sender: msg.isSendByCurrentUser ? 'user' : 'other',
            senderName: msg.senderName,
            timestamp: msg.timestamp,
            isRead: msg.isRead,
          }));

          // Sort messages by timestamp before setting state
          setMessages(sortMessagesByTimestamp(chatMessages));

          // Collect unread message IDs
          const unreadIds = response.data
            .filter((msg) => !msg.isRead && !msg.isSendByCurrentUser)
            .map((msg) => msg.id);

          setUnreadMessageIds(unreadIds);

          // Mark messages as read if there are any unread
          if (unreadIds.length > 0) {
            await markMessagesAsRead(unreadIds);
          }
        }

        // Set up message handlers
        ChatService.setOnReceiveMessage(
          (
            messageId,
            jobId,
            senderUserId,
            senderName,
            message,
            _messageType, // Prefixed with underscore to indicate it's not used
            _attachmentUrl, // Prefixed with underscore to indicate it's not used
            timestamp,
          ) => {
            // Only handle messages for this job
            if (parseInt(jobId) === parseInt(route.params.jobId)) {
              const newMessage = {
                id: messageId,
                text: message,
                sender: parseInt(senderUserId) === user.id ? 'user' : 'other',
                senderName: senderName,
                timestamp: timestamp,
                isRead: parseInt(senderUserId) === user.id, // Messages sent by current user are automatically read
              };

              setMessages((prevMessages) =>
                sortMessagesByTimestamp([...prevMessages, newMessage]),
              );

              // Mark message as read if it's from someone else
              if (parseInt(senderUserId) !== user.id) {
                markMessagesAsRead([messageId]);
              }
            }
          },
        );

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        Alert.alert('Error', 'Failed to load chat messages');
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      const cleanup = async () => {
        try {
          const userModelStr = await AsyncStorage.getItem(Constants.USER_MODEL);
          const user = JSON.parse(userModelStr);

          if (user) {
            await ChatService.leaveChatGroup(jobId, user.id);
          }

          ChatService.setOnReceiveMessage(null);
        } catch (error) {
          console.error('Error cleaning up chat:', error);
        }
      };

      cleanup();
    };
  }, [jobId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: true});
      }, 100); // Small delay to ensure the layout is complete
    }
  }, [messages]);

  // Mark messages as read
  const markMessagesAsRead = async (messageIds) => {
    try {
      await ChatApi.markMessagesAsRead(jobId, messageIds);
      // Update local state to mark these messages as read
      setMessages((prevMessages) => {
        // Update read status
        const updatedMessages = prevMessages.map((msg) =>
          messageIds.includes(msg.id) ? {...msg, isRead: true} : msg,
        );
        // Maintain sorted order
        return sortMessagesByTimestamp(updatedMessages);
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const userModelStr = await AsyncStorage.getItem(Constants.USER_MODEL);
      const user = JSON.parse(userModelStr);

      if (!user) {
        Alert.alert('Error', 'You need to be logged in to send messages');
        return;
      }

      // Generate a unique ID for the message
      const messageId = uuid();

      // Optimistically add message to UI
      const message = {
        id: messageId,
        text: newMessage,
        sender: 'user',
        senderName: user.name,
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      setMessages((prevMessages) =>
        sortMessagesByTimestamp([...prevMessages, message]),
      );
      setNewMessage('');

      // Send message via SignalR
      const success = await ChatService.sendChatMessage(
        messageId,
        jobId,
        newMessage,
        user.id,
        ChatMessageType.Text,
      );

      if (!success) {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${year}-${month}-${day} ${hour}:${min}`;
  };

  const renderMessage = ({item}) => {
    const isUser = item.sender === 'user';
    const formattedTime = formatDateTime(item.timestamp);

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.agentMessageContainer,
        ]}>
        {!isUser && (
          <Text
            style={[
              styles.senderName,
              isUser ? styles.userSenderName : styles.agentSenderName,
            ]}>
            {item.senderName}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.agentMessageBubble,
          ]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.agentTimestamp,
            ]}>
            {formattedTime}
          </Text>
        </View>
      </View>
    );
  };

  // Empty message component
  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Constants.THEME_COLOR} />
          <Text style={styles.emptyText}>
            {translationString.loading_messages || 'Loading messages...'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {translationString.no_messages ||
            'No messages yet. Start the conversation!'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList,
          ]}
          onContentSizeChange={() => {
            if (messages.length > 0 && flatListRef.current) {
              flatListRef.current.scrollToEnd({animated: true});
            }
          }}
          onLayout={() => {
            if (messages.length > 0 && flatListRef.current) {
              flatListRef.current.scrollToEnd({animated: true});
            }
          }}
          ListEmptyComponent={renderEmptyComponent}
        />
        {!isLoading && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={translationString.enter_message}
              placeholderTextColor="#A0A0A0"
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={newMessage.trim() === ''}>
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={
                  newMessage.trim() === '' ? '#A0A0A0' : Constants.THEME_COLOR
                }>
                <Path
                  d="M22 2L11 13"
                  stroke={
                    newMessage.trim() === '' ? '#A0A0A0' : Constants.THEME_COLOR
                  }
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke={
                    newMessage.trim() === '' ? '#A0A0A0' : Constants.THEME_COLOR
                  }
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  agentMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: Constants.THEME_COLOR,
    borderBottomRightRadius: 4,
  },
  agentMessageBubble: {
    backgroundColor: '#888888',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userSenderName: {
    alignSelf: 'flex-end',
    color: Constants.THEME_COLOR,
  },
  agentSenderName: {
    alignSelf: 'flex-start',
    color: '#555555',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  userTimestamp: {
    textAlign: 'right',
  },
  agentTimestamp: {
    textAlign: 'left',
  },
  readStatus: {
    fontSize: 12,
    color: '#A0A0A0',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
});

export default ChatScreen;
