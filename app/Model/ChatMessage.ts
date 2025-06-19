export enum ChatMessageType {
  Text = 0,
  Image = 1,
  File = 2
}

export interface ChatMessageDto {
  id: string;
  jobId: number;
  senderUserId: number;
  senderName: string;
  messageContent: string;
  messageType?: ChatMessageType;
  attachmentUrl?: string;
  timestamp: string;
  isRead: boolean;
  isSendByCurrentUser: boolean;
}

export interface MarkReadRequestModel {
  messageIds: string[];
}

export interface JobChatResponseModel {
  dataArray: JobChatDto[];
  skip: number;
  take: number;
  total: number;
}

export interface JobChatDto {
  id: number;
  trackingList: string;
  destination: string;
  consignee: string;
  lastMessageContent: string;
  lastMessageTime: string;
  unreadCount: number;
}
