import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {MyAuthInfo} from '../../../services/auth-services/dto/my-auth-info';
import {MyAuthService} from '../../../services/auth-services/my-auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  adminInfo: MyAuthInfo | null = null;
  private authSubscription: Subscription | null = null;

  constructor(private authService: MyAuthService) {}

  ngOnInit(): void {
    // Subscribe to auth state for real-time updates
    this.authSubscription = this.authService.authStateObservable().subscribe((token) => {
      this.adminInfo = token?.myAuthInfo ?? null;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.authSubscription?.unsubscribe();
  }

  getAdminName(): string {
    return this.adminInfo?.username ?? 'Unknown Admin';
  }
}
