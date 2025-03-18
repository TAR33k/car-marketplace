import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { MyConfig } from '../../../../my-config';
import {ChatMessage, ChatUser, MessageStatus, SendMessageRequest} from '../models/chat.model';
import {MyAuthService} from '../../../../services/auth-services/my-auth.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
  private hubConnection!: HubConnection;
  private currentChatUserId?: number;
  private messagesByUser = new Map<number, ChatMessage[]>();
  private unreadMessageCounts = new BehaviorSubject<Map<number, number>>(new Map());
  public unreadCounts$ = this.unreadMessageCounts.asObservable();
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private hubUrl = `${MyConfig.api_address}/chathub`;
  private typingUsersSubject = new BehaviorSubject<number[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private users: ChatUser[] = [];
  private usersSubject = new BehaviorSubject<ChatUser[]>([]);
  public users$ = this.usersSubject.asObservable();
  private newMessageReceived$ = new Subject<ChatMessage>();
  private isInitializing = false;

  constructor(
    private authService: MyAuthService
  ) {
    this.loadUnreadCountsFromStorage();
  }
  public async initializeChat(): Promise<void> {
    if (this.isInitializing || this.isConnected()) {
      return;
    }

    this.isInitializing = true;
    try {
      await this.initializeConnection();
    } finally {
      this.isInitializing = false;
    }
  }
  private async initializeConnection() {
    const loginToken = this.authService.getLoginToken();
    if (!loginToken) {
      console.error('No auth token available');
      return;
    }

    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${this.hubUrl}?my-auth-token=${loginToken}`)
        .withAutomaticReconnect()
        .build();
      this.setupHubEvents();
      await this.startConnection();
    } catch (err) {
      console.error('Error initializing connection:', err);
    }
  }

  updateUsers(users: ChatUser[]) {
    // Preserve any stored user that might not be in the users list
    const storedUser = sessionStorage.getItem('selectedChatUser');
    if (storedUser) {
      const chatUser = JSON.parse(storedUser);
      if (!users.some(u => u.id === chatUser.id)) {
        users = [...users, chatUser];
      }
    }

    this.users = users;
    this.usersSubject.next(users);
  }
  private setupHubEvents() {
    if (!this.hubConnection) {
      console.error('Hub connection not initialized');
      return;
    }
    this.hubConnection.onclose((error) => {
      console.log('Connection closed:', error);
      this.connectionStatusSubject.next(false);
    });
    this.hubConnection.onreconnecting((error) => {
      console.log('Attempting to reconnect:', error);
      this.connectionStatusSubject.next(false);
    });
    this.hubConnection.onreconnected((connectionId) => {
      console.log('Reconnected with ID:', connectionId);
      this.connectionStatusSubject.next(true);
    });
    this.hubConnection.on('MessageSent', (message: ChatMessage) => {
      const userMessages = this.messagesByUser.get(this.currentChatUserId!) || [];

      // Find and replace the temporary message
      const tempIndex = userMessages.findIndex(m =>
        m.timestamp.getTime() === new Date(message.timestamp).getTime() &&
        m.status === MessageStatus.Sending
      );

      if (tempIndex !== -1) {
        userMessages[tempIndex] = {
          ...message,
          timestamp: new Date(message.timestamp)
        };
        this.messagesByUser.set(this.currentChatUserId!, [...userMessages]);
        this.messagesSubject.next([...userMessages]);
      }
    });

    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      const authInfo = this.authService.getMyAuthInfo();
      const currentUserId = authInfo?.userId;
      message.timestamp = new Date(message.timestamp);

      const conversationUserId = message.senderId === currentUserId ?
        message.receiverId : message.senderId;

      let userMessages = this.messagesByUser.get(conversationUserId) || [];

      // Add new message to conversation
      userMessages = [...userMessages, message];
      userMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      this.messagesByUser.set(conversationUserId, userMessages);

      // Emit the new message event separately
      if (message.receiverId === currentUserId) {
        this.newMessageReceived$.next(message);
      }

      if (conversationUserId === this.currentChatUserId) {
        this.messagesSubject.next(userMessages);
      } else if (message.receiverId === currentUserId) {
        // Update unread count for other conversations
        const counts = this.unreadMessageCounts.value;
        const currentCount = counts.get(conversationUserId) || 0;
        counts.set(conversationUserId, currentCount + 1);
        this.unreadMessageCounts.next(new Map(counts));
        this.saveUnreadCountsToStorage(counts);
      }
    });
    this.hubConnection.on('UserTyping', (data: { userId: number, isTyping: boolean }) => {
      const typingUsers = [...this.typingUsersSubject.value];
      if (data.isTyping) {
        if (!typingUsers.includes(data.userId)) {
          typingUsers.push(data.userId);
        }
      } else {
        const index = typingUsers.indexOf(data.userId);
        if (index > -1) {
          typingUsers.splice(index, 1);
        }
      }
      this.typingUsersSubject.next(typingUsers);
    });

    this.hubConnection.on('MessageDelivered', (messageId: number) => {
      this.updateMessageStatus(messageId, MessageStatus.Delivered);
    });

    this.hubConnection.on('MessageRead', (messageId: number) => {
      this.updateMessageStatus(messageId, MessageStatus.Read);
    });

    this.hubConnection.on('UnreadMessageCounts', (counts: Array<{senderId: number, count: number}>) => {
      const unreadMap = new Map<number, number>();
      counts.forEach(c => unreadMap.set(c.senderId, c.count));
      this.unreadMessageCounts.next(unreadMap);
      this.saveUnreadCountsToStorage(unreadMap);
    });

    this.hubConnection.on('UserStatusChanged', (data: {
      userId: number,
      isOnline: boolean,
      lastSeen: string
    }) => {
      const userIndex = this.users.findIndex((user: ChatUser) => user.id === data.userId);
      if (userIndex !== -1) {
        const lastSeenDate = data.lastSeen ? new Date(data.lastSeen + 'Z') : new Date();

        this.users[userIndex] = {
          ...this.users[userIndex],
          isOnline: data.isOnline,
          lastSeen: lastSeenDate
        };
        this.usersSubject.next([...this.users]);
      }
    });
  }
  getUsersObservable(): Observable<ChatUser[]> {
    return this.users$;
  }
  private updateMessageStatus(messageId: number, status: MessageStatus) {
    this.messagesByUser.forEach((messages, userId) => {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          status: status
        };
        this.messagesByUser.set(userId, updatedMessages);

        if (userId === this.currentChatUserId) {
          this.messagesSubject.next(updatedMessages);
        }
      }
    });
  }
  public async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      console.error('Hub connection not initialized');
      return;
    }
    try {
      await this.hubConnection.start();
      console.log('SignalR Connected successfully');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;

      // Request initial unread counts after connection
      await this.hubConnection.invoke('GetUnreadMessageCounts');

      // Load initial messages once connected
      const authInfo = this.authService.getMyAuthInfo();
      if (authInfo?.userId) {
        this.loadMessages(authInfo.userId);
      }
    } catch (err) {
      console.error('Error while establishing connection:', err);
      this.connectionStatusSubject.next(false);

      if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++;
        console.log(`Retrying connection... Attempt ${this.reconnectAttempts}`);
        setTimeout(() => this.startConnection(), 5000);
      } else {
        console.error('Max reconnection attempts reached');
      }
    }
  }
  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => console.log('SignalR connection stopped'))
        .catch((err) => console.error('Error while stopping SignalR connection:', err));
    }
  }
  async sendMessage(messageRequest: SendMessageRequest): Promise<boolean> {
    if (!this.isConnected()) {
      console.error('Cannot send message: Not connected');
      return false;
    }

    // Create a temporary message
    const tempMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      senderId: this.authService.getMyAuthInfo()?.userId!,
      receiverId: messageRequest.receiverId,
      content: messageRequest.content,
      timestamp: new Date(),
      status: MessageStatus.Sending
    };

    // Add to local messages immediately
    const userMessages = this.messagesByUser.get(this.currentChatUserId!) || [];
    const updatedMessages = [...userMessages, tempMessage];
    this.messagesByUser.set(this.currentChatUserId!, updatedMessages);
    this.messagesSubject.next(updatedMessages);

    try {
      await this.hubConnection.invoke('SendMessage', messageRequest);

      // Update the message status to sent
      tempMessage.status = MessageStatus.Sent;
      this.messagesSubject.next([...updatedMessages]);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      // Update the message status to failed
      tempMessage.status = MessageStatus.Failed;
      this.messagesSubject.next([...updatedMessages]);
      return false;
    }
  }

  async sendTypingNotification(receiverId: number, isTyping: boolean): Promise<void> {
    if (!this.isConnected()) return;

    try {
      if (isTyping) {
        await this.hubConnection.invoke('UserTyping', receiverId);
      } else {
        await this.hubConnection.invoke('StopTyping', receiverId);
      }
    } catch (err) {
      console.error('Error sending typing notification:', err);
    }
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    if (!this.isConnected()) return;
    await this.hubConnection.invoke('MarkMessageAsRead', messageId);
  }

  async markMessageAsDelivered(messageId: number): Promise<void> {
    if (!this.isConnected()) return;
    await this.hubConnection.invoke('MarkMessageAsDelivered', messageId);
  }

  private isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }
  getMessages(): Observable<ChatMessage[]> {
    return this.messagesSubject.asObservable();
  }
  getTypingUsers(): Observable<number[]> {
    return this.typingUsersSubject.asObservable();
  }
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }
  async loadMessages(userId: number): Promise<void> {
    this.currentChatUserId = userId;

    try {
      const messages: ChatMessage[] = await this.hubConnection.invoke('GetChatHistory', userId);

      // Convert timestamps to Date objects
      const processedMessages = messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));

      // Mark unread messages as read
      const unreadMessages = processedMessages.filter(m =>
        m.receiverId === this.authService.getMyAuthInfo()?.userId &&
        m.status !== MessageStatus.Read
      );

      this.messagesByUser.set(userId, processedMessages);
      this.messagesSubject.next(processedMessages);

      // Update unread counts
      const counts = this.unreadMessageCounts.value;
      counts.delete(userId);
      this.unreadMessageCounts.next(new Map(counts));
      this.saveUnreadCountsToStorage(counts);

      // Mark messages as read after updating UI
      for (const message of unreadMessages) {
        await this.markMessageAsRead(message.id);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }

  private saveUnreadCountsToStorage(counts: Map<number, number>) {
    const countsObj = Object.fromEntries(counts);
    localStorage.setItem('unreadCounts', JSON.stringify(countsObj));
  }

  private loadUnreadCountsFromStorage() {
    const stored = localStorage.getItem('unreadCounts');
    if (stored) {
      const countsObj = JSON.parse(stored);
      const counts = new Map(Object.entries(countsObj).map(([k, v]) => [Number(k), v as number]));
      this.unreadMessageCounts.next(counts);
    }
  }

  // Clear messages when changing chats
  clearMessages() {
    this.currentChatUserId = undefined;
    this.messagesSubject.next([]);
  }

  getNewMessageReceived(): Observable<ChatMessage> {
    return this.newMessageReceived$.asObservable();
  }

  async refreshUnreadCounts(): Promise<void> {
    if (!this.isConnected()) return;
    try {
      await this.hubConnection.invoke('GetUnreadMessageCounts');
    } catch (err) {
      console.error('Error refreshing unread counts:', err);
    }
  }
}
