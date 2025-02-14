import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MyAuthService } from '../../../../services/auth-services/my-auth.service';
import {Subscription, Subject, takeUntil} from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { ChatService } from '../../chat/services/chat.service';

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
  private authSubscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();
  totalUnreadCount: number = 0;

  constructor(
    private router: Router,
    private myAuthService: MyAuthService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value) {
        this.handleSearch(value);
      }
    });

    this.authSubscription = this.myAuthService.authStateObservable().subscribe(authState => {
      this.isLoggedIn = !!authState;
      this.username = authState?.myAuthInfo?.username ?? null;
      this.isAdmin = authState?.myAuthInfo?.isAdmin ?? false;
    });

    // Initialize user state
    this.updateUserState();

    this.chatService.unreadCounts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(counts => {
        this.totalUnreadCount = Array.from(counts.values())
          .reduce((total, count) => total + count, 0);
      });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleSearch(searchTerm: string) {
    if (searchTerm.trim()) {
      this.router.navigate(['/cars'], {
        queryParams: { search: searchTerm }
      });
    }
  }

  navigateToProfile() {
    this.router.navigate(['/client/profile']);
  }

  navigateToSettings() {
    this.router.navigate(['/client/settings']);
  }

  onLogout() {
    this.myAuthService.setLoggedInUser(null);
    localStorage.clear();
    this.router.navigate(['/auth/login']);
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.username = null;
  }

  switchModule() {
    if (this.isOnAdminPage()) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  isOnAdminPage(): boolean {
    return this.router.url.startsWith('/admin');
  }

  private updateUserState() {
    this.isLoggedIn = this.myAuthService.isLoggedIn();
    this.username = this.myAuthService.getUsername();
    this.isAdmin = this.myAuthService.isAdmin();
  }
}
