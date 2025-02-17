import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { MyAuthService } from '../services/auth-services/my-auth.service';

export class AuthGuardData {
  isAdmin?: boolean;
  isManager?: boolean;
  requiresAuth?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: MyAuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const guardData = route.data as AuthGuardData;

    // Check if authentication is required
    if (guardData.requiresAuth || guardData.isAdmin || guardData.isManager) {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/auth/login']);
        return false;
      }
    }

    // Check admin access rights
    if (guardData.isAdmin && !this.authService.isAdmin()) {
      this.router.navigate(['/landing-page']);
      return false;
    }

    // Check manager access rights
    if (guardData.isManager && !this.authService.isManager()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true; // Access allowed
  }
}
