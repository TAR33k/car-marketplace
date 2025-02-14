export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  status: MessageStatus;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
}

export interface ChatUser {
    id: number;
    username: string;
    isOnline: boolean;
    lastSeen?: Date;
    isTyping?: boolean;
}

export enum MessageStatus {
    Sending = 'sending',
    Sent = 'sent',
    Delivered = 'delivered',
    Read = 'read',
    Failed = 'failed'
}
