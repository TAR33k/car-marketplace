import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {filter, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';
import {ChatService} from '../services/chat.service';
import {ChatMessage, ChatUser, MessageStatus, SendMessageRequest} from '../models/chat.model';
import { ChatUserService } from '../services/chat-user.service';
import { MyAuthService } from '../../../../services/auth-services/my-auth.service';
import {Router} from '@angular/router';
import {ChatSoundService} from '../services/chat-sound.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    host: {
      class: 'chat-page'
    }
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private shouldScrollToBottom = true;
  private readonly SCROLL_THRESHOLD = 1;
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
  unreadCounts = new Map<number, number>();
  soundsEnabled = true;

  constructor(
    private chatService: ChatService,
    private chatUserService: ChatUserService,
    private chatSoundService: ChatSoundService,
    private authService: MyAuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
    const authInfo = this.authService.getMyAuthInfo();
    this.currentUserId = authInfo?.userId ?? 0;
  }
  ngOnInit() {
    // Check for stored session first
    if (this.authService.hasValidStoredSession()) {
      this.initializeChatService();
    }

    // Subscribe to auth state changes for fresh logins
    this.authService.authStateObservable()
      .pipe(
        filter(token => token !== null),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.initializeChatService();
      });

    const storedUser = sessionStorage.getItem('selectedChatUser');
    if (storedUser) {
      const chatUser = JSON.parse(storedUser);
      if (chatUser.lastSeen) {
        chatUser.lastSeen = new Date(chatUser.lastSeen);
      }

      if (!this.users.some(u => u.id === chatUser.id)) {
        this.users = [...this.users, chatUser];
        this.filteredUsers = this.users;
      }

      this.selectedUser = chatUser;
      sessionStorage.removeItem('selectedChatUser');
    }
  }

  private initializeChatService(): void {
    if (this.currentUserId === 0) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    // Subscribe to unread counts before connection
    this.chatService.unreadCounts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(counts => {
        this.unreadCounts = counts;
      });

    // Initialize chat connection
    this.chatService.initializeChat().then(() => {
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
          this.chatService.refreshUnreadCounts();

          // Load messages for selected user if exists
          if (this.selectedUser) {
            this.chatService.loadMessages(this.selectedUser.id);
          }
        });

      // Subscribe to user updates
      this.chatService.getUsersObservable()
        .pipe(takeUntil(this.destroy$))
        .subscribe(users => {
          this.users = users;
          this.filteredUsers = users;

          if (this.selectedUser) {
            const updatedUser = users.find(u => u.id === this.selectedUser!.id);
            if (updatedUser) {
              this.selectedUser = updatedUser;
            }
          }
        });

      // Subscribe to new messages for sound notifications
      this.chatService.getNewMessageReceived()
        .pipe(takeUntil(this.destroy$))
        .subscribe(message => {
          if (this.selectedUser?.id === message.senderId) {
            // Message is in current chat
            this.chatSoundService.playMessageReceived();
          } else {
            // Message is in another chat
            this.chatSoundService.playNotification();
          }
        });
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
        if (this.selectedUser) {
          this.chatService.sendTypingNotification(this.selectedUser.id, !!value);
        }
      });
  }

  getMessageStatusIcon(status: MessageStatus): string {
    switch (status) {
      case MessageStatus.Sending:
        return '⋯';
      case MessageStatus.Sent:
        return '✓';
      case MessageStatus.Delivered:
        return '✓✓';
      case MessageStatus.Read:
        return '✓✓';
      case MessageStatus.Failed:
        return '❌';
      default:
        return '';
    }
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

    this.messageForm.reset();

    const messageRequest: SendMessageRequest = {
      receiverId: this.selectedUser.id,
      content: sanitizedContent
    };

    try {
      const success = await this.chatService.sendMessage(messageRequest);
      if (success) {
        this.chatSoundService.playMessageSent();
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private handleReceivedMessage(message: ChatMessage) {
    if (message.receiverId === this.currentUserId) {
      if (this.selectedUser?.id === message.senderId) {
        // Mark message as read immediately if chat is open
        if (message.status !== MessageStatus.Read) {
          this.chatService.markMessageAsRead(message.id);
        }
      } else if (message.status === MessageStatus.Sent) {
        // Mark as delivered if we received it but chat isn't open
        this.chatService.markMessageAsDelivered(message.id);
      }
    }
  }
  getUnreadCount(userId: number): number {
    const count = this.unreadCounts.get(userId);
    return count !== undefined ? count : 0;
  }

  async selectUser(user: ChatUser) {
    this.selectedUser = user;
    this.chatService.clearMessages();
    await this.chatService.loadMessages(user.id);
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

  getAvatarColor(username: string): string {
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
      '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
      '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  toggleSounds() {
    this.soundsEnabled = !this.soundsEnabled;
    this.chatSoundService.toggleSounds(this.soundsEnabled);
  }

  navigateToUserProfile(user: ChatUser): void {
    const userToStore = {
      ...user,
      lastSeen: user.lastSeen?.toISOString()
    };
    sessionStorage.setItem('selectedChatUser', JSON.stringify(userToStore));
    this.router.navigate(['/profile', user.id]);
  }
}
