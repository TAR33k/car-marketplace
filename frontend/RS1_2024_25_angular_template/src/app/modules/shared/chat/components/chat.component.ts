import {AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {filter, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, takeUntil, switchMap} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';
import {ChatService} from '../services/chat.service';
import {ChatMessage, ChatTheme, ChatUser, MessageStatus, SendMessageRequest} from '../models/chat.model';
import { timer } from 'rxjs';
import { ChatUserService } from '../services/chat-user.service';
import { MyAuthService } from '../../../../services/auth-services/my-auth.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private shouldScrollToBottom = true;
  private lastScrollHeight = 0;
  private readonly SCROLL_THRESHOLD = 100;
  private readonly TYPING_TIMEOUT = 2000;
  theme?: ChatTheme;
  maxHeight: string = '100vh';
  messages: ChatMessage[] = [];
  users: ChatUser[] = [];
  typingUsers: number[] = [];
  isConnected = false;
  messageForm: FormGroup;
  selectedUser?: ChatUser;
  filteredUsers: ChatUser[] = [];
  messageGroups: { date: string; messages: ChatMessage[] }[] = [];
  currentUserId: number;
  private destroy$ = new Subject<void>();
  private typingSubject = new Subject<void>();
  constructor(
    private chatService: ChatService,
    private chatUserService: ChatUserService,
    private authService: MyAuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
    const authInfo = this.authService.getMyAuthInfo();
    this.currentUserId = authInfo?.userId ?? 0;
  }
  ngOnInit() {
    if (this.currentUserId === 0) {
      console.error('User not authenticated');
      return;
    }
    // Wait for connection before loading initial data
    this.chatService.getConnectionStatus()
      .pipe(
        takeUntil(this.destroy$),
        filter(isConnected => isConnected)
      )
      .subscribe(() => {
        this.initializeSubscriptions();
        this.setupTypingNotification();
        this.loadUsers();

        // Load messages for selected user if exists
        if (this.selectedUser) {
          this.chatService.loadMessages(this.selectedUser.id);
        }
      });
  }

  ngAfterViewChecked() {
    this.handleScroll();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
    this.chatService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isConnected => {
        this.isConnected = isConnected;
        if (isConnected) {
          console.log('Connected: Initializing subscriptions');
          this.subscribeToMessages();
          this.chatService.getTypingUsers()
            .pipe(takeUntil(this.destroy$))
            .subscribe(typingUsers => {
              this.typingUsers = typingUsers;
            });
        }
      });
  }

  private subscribeToMessages() {
    this.chatService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.groupMessagesByDate(); // Make sure to group messages
        if (messages.length > 0) {
          this.handleReceivedMessage(messages[messages.length - 1]);
        }
        this.scrollToBottom();
      });
  }

  private setupTypingNotification() {
    this.messageForm.get('content')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (this.selectedUser && value) {
          this.chatService.sendTypingNotification(this.selectedUser.id);
        }
      });
  }

  async sendMessage() {
    if (this.messageForm.invalid || !this.selectedUser) return;
    if (!this.isConnected) {
      console.error('Cannot send message: Not connected to server');
      return;
    }
    const content = this.messageForm.get('content')?.value;
    const sanitizedContent = this.sanitizer.sanitize(1, content);
    if (!sanitizedContent?.trim()) return;
    const messageRequest: SendMessageRequest = {
      receiverId: this.selectedUser.id,
      content: sanitizedContent
    };
    try {
      const success = await this.chatService.sendMessage(messageRequest);
      if (!success) {
        console.error('Failed to send message');
      } else {
        this.messageForm.reset();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private handleReceivedMessage(message: ChatMessage) {
    if (message.receiverId === this.currentUserId) {
      if (this.selectedUser?.id === message.senderId) {
        this.chatService.markMessageAsRead(message.id);
      }
    }
  }
  async selectUser(user: any) {
    this.selectedUser = user;
    this.chatService.clearMessages(); // Clear existing messages
    await this.chatService.loadMessages(user.id); // Load messages for this chat
    this.groupMessagesByDate();
  }
  private loadUsers() {
    this.chatUserService.getAvailableUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users.filter(u => u.id !== this.currentUserId);
          this.filteredUsers = this.users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
  }
  private loadChatHistory(userId: number) {
    this.chatService.loadChatHistory(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.groupMessagesByDate();
        this.scrollToBottom();
      });
  }
  searchUsers(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(searchTerm)
    );
  }
  isUserTyping(userId: number): boolean {
    return this.typingUsers.includes(userId);
  }
  private handleScroll() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }
  onScroll(event: any) {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < this.SCROLL_THRESHOLD;
    this.shouldScrollToBottom = atBottom;
  }
  private scrollToBottom() {
    const chatContainer = this.scrollContainer?.nativeElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  private groupMessagesByDate() {
    const groups = this.messages.reduce((groups: any, message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
    this.messageGroups = Object.keys(groups).map(date => ({
      date,
      messages: groups[date]
    }));
  }
}
