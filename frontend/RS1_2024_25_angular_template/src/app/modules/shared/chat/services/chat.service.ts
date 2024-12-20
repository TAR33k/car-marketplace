import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
import { MyConfig } from '../../../../my-config';
import {ChatMessage, ChatUser, MessageStatus, SendMessageRequest} from '../models/chat.model';
import { ChatUserService } from './chat-user.service';
import { throwError } from 'rxjs';
import {MyAuthService} from '../../../../services/auth-services/my-auth.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
  private hubConnection!: HubConnection;
  private hubUrl = `${MyConfig.api_address}/chathub`;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private typingUsersSubject = new BehaviorSubject<number[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private typingTimeout: any;
  constructor(
    private http: HttpClient,
    private authService: MyAuthService
  ) {
    this.initializeConnection();
  }
  private async initializeConnection() {
    const loginToken = this.authService.getLoginToken();
    if (!loginToken?.token) {
      console.error('No auth token available');
      return;
    }
    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${this.hubUrl}?my-auth-token=${loginToken.token}`)
        .withAutomaticReconnect()
        .build();
      this.setupHubEvents();
      await this.startConnection();
    } catch (err) {
      console.error('Error initializing connection:', err);
    }
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
    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      console.log('Received new message:', message);
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });
    this.hubConnection.on('UserTyping', (userId: number) => {
      const typingUsers = [...this.typingUsersSubject.value];
      if (!typingUsers.includes(userId)) {
        typingUsers.push(userId);
        this.typingUsersSubject.next(typingUsers);
      }
    });
  }
  private async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      console.error('Hub connection not initialized');
      return;
    }
    try {
      await this.hubConnection.start();
      console.log('SignalR Connected successfully');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;

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

  async sendMessage(messageRequest: SendMessageRequest): Promise<boolean> {
    if (!this.isConnected()) {
      console.error('Cannot send message: Not connected');
      return false;
    }
    try {
      await this.hubConnection.invoke('SendMessage', messageRequest);
      console.log('Message sent successfully');
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
      }
      return false;
    }
  }

  async sendTypingNotification(receiverId: number): Promise<void> {
    if (!this.isConnected()) return;

    try {
      await this.hubConnection.invoke('UserTyping', receiverId);

      // Clear existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      // Remove user from typing list after 2 seconds
      this.typingTimeout = setTimeout(() => {
        const typingUsers = this.typingUsersSubject.value
          .filter(id => id !== receiverId);
        this.typingUsersSubject.next(typingUsers);
      }, 2000);
    } catch (err) {
      console.error('Error sending typing notification:', err);
    }
  }

  loadChatHistory(userId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${MyConfig.api_address}/chats/history/${userId}`)
      .pipe(catchError(error => {
        console.error('Error loading chat history:', error);
        return [];
      }));
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
  async loadMessages(otherUserId: number): Promise<void> {
    if (!this.isConnected()) {
      console.error('Cannot load messages: Not connected');
      return;
    }
    try {
      const messages = await this.hubConnection.invoke('GetChatHistory', otherUserId);
      this.messagesSubject.next(messages);

    } catch (err) {
      console.error('Error loading messages:', err);
      // Optionally fallback to HTTP endpoint
      this.loadChatHistory(otherUserId).subscribe(
        messages => this.messagesSubject.next(messages)
      );
    }
  }
  // Clear messages when changing chats
  clearMessages() {
    this.messagesSubject.next([]);
  }
}
