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
    this.authSubscription = this.authService.authStateObservable().subscribe((authState) => {
      this.adminInfo = authState; // Direkno postavi adminInfo na authState
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
