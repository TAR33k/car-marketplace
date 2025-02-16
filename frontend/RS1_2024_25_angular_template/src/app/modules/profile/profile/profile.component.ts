import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UserGetByIdEndpointService } from '../../../endpoints/user-endpoints/user-get-by-id-endpoint.service';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import { NotificationService } from '../../../services/notification.service';
import { filter, Subject, takeUntil } from 'rxjs';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  userId: number = 0;
  user: any = null;
  isOwnProfile = false;
  activeTab = 0;
  loading = false;
  private destroy$ = new Subject<void>();
  isLoggedIn = false;

  readonly avatarColors = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
    '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
    '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userEndpoint: UserGetByIdEndpointService,
    private authService: MyAuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Listen to both params and navigation events
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.updateProfile(+params['id']);
    });

    // Listen to navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const id = +this.route.snapshot.params['id'];
      if (id !== this.userId) {
        this.updateProfile(id);
      }
    });

    this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateProfile(newUserId: number) {
    this.userId = newUserId;
    this.isOwnProfile = this.userId === this.authService.getMyAuthInfo()?.userId;
    this.loadUserProfile();
  }

  private loadUserProfile() {
    this.loading = true;
    this.user = null; // Clear current user data

    this.userEndpoint.handleAsync(this.userId).subscribe({
      next: (userData) => {
        this.user = userData;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.notificationService.notifyUserAction('Error loading profile');
        this.loading = false;
      }
    });
  }

  getAvatarColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  onTabChange(event: MatTabChangeEvent) {
    // Preload the next tab's content
    setTimeout(() => {
      this.activeTab = event.index;
    }, 0);
  }

  startChat() {
    if (!this.user) return;

    // Store the user info for the chat component
    const chatUser = {
      id: this.user.id,
      username: this.user.username,
      firstName: this.user.firstName,
      lastName: this.user.lastName
    };

    // Store the selected user in session storage
    sessionStorage.setItem('selectedChatUser', JSON.stringify(chatUser));

    // Navigate to chat
    this.router.navigate(['/chat']);
  }
}
