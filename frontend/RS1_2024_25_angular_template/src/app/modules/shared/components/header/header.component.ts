import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MyAuthService } from '../../../../services/auth-services/my-auth.service';
import { SendInviteEmailService } from '../../../../services/invite-service/send-invite-email.service';
import { NotificationService } from '../../../../services/notification.service';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { ChatService } from '../../chat/services/chat.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('userMenuTrigger') userMenuTrigger!: MatMenuTrigger;
  searchControl = new FormControl('');
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  email: string = ''; // Email za pozivnicu
  isInviteModalOpen = false;
  emailError: string | null = null;
  private authSubscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();
  totalUnreadCount: number = 0;

  constructor(
    private router: Router,
    private myAuthService: MyAuthService,
    private sendInviteEmailService: SendInviteEmailService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        if (value) {
          this.handleSearch(value);
        }
      });

    this.authSubscription = this.myAuthService.authStateObservable().subscribe(authState => {
      this.isLoggedIn = !!authState;
      this.username = authState?.username ?? null;
      this.isAdmin = authState?.isAdmin ?? false;
    });

    this.updateUserState();
    if (this.isLoggedIn) {
      this.chatService.startConnection();
    }

    this.chatService.unreadCounts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(counts => {
        this.totalUnreadCount = Array.from(counts.values()).reduce((total, count) => total + count, 0);
      });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.stopConnection();
  }

  handleSearch(searchTerm: string) {
    if (searchTerm.trim()) {
      this.router.navigate(['/cars'], {
        queryParams: { search: searchTerm }
      });
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile', this.myAuthService.getMyAuthInfo()?.userId]);
  }

  navigateToSettings() {
    this.router.navigate(['/profile/settings']);
  }

  onLogout() {
    this.myAuthService.setLoggedInUser(null);
    localStorage.clear();
    this.router.navigate(['/auth/login']);
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.username = null;
    this.chatService.stopConnection();
  }

  switchModule() {
    this.router.navigate([this.isOnAdminPage() ? '/' : '/admin']);
  }

  isOnAdminPage(): boolean {
    return this.router.url.startsWith('/admin');
  }

  openInviteModal() {
    this.isInviteModalOpen = true;
    this.emailError = null;
  }

  closeInviteModal() {
    this.isInviteModalOpen = false;
  }

  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !this.email ? null : !emailRegex.test(this.email) ? 'Please enter a valid email address (e.g., name@example.com)' : null;
  }

  sendInvite() {
    if (this.emailError) return;

    const token = this.myAuthService.getLoginToken();

    if (!token) {
      this.notificationService.notifyUserAction('No valid token found, please log in.');
      return;
    }

    this.sendInviteEmailService.sendInviteEmail(this.email).subscribe(
      () => {
        this.notificationService.notifyUserAction('Invitation sent successfully! Your friend will receive the email shortly.');
        this.closeInviteModal();
      },
      () => {
        this.notificationService.notifyUserAction('Error! We couldn’t send the invitation email. Please try again later.');
      }
    );
  }

  private updateUserState() {
    this.isLoggedIn = this.myAuthService.isLoggedIn();
    this.username = this.myAuthService.getUsername();
    this.isAdmin = this.myAuthService.isAdmin();
  }

  onSellClick(event: Event): void {
    if (!this.isLoggedIn) {
      event.preventDefault();
      this.snackBar
        .open('Please log in to sell a car', 'Login', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['warning-snackbar']
        })
        .onAction()
        .subscribe(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: '/public/advertisements/create' }
          });
        });
    }
  }
}
