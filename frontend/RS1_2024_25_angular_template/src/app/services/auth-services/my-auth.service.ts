import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MyAuthInfo } from './dto/my-auth-info';
import { LoginTokenDto } from './dto/login-token-dto';

@Injectable({ providedIn: 'root' })
export class MyAuthService {
  private authState = new BehaviorSubject<LoginTokenDto | null>(this.getLoginToken());

  constructor() {}

  getMyAuthInfo(): MyAuthInfo | null {
    return this.authState.getValue()?.myAuthInfo ?? null;
  }

  isLoggedIn(): boolean {
    return this.getMyAuthInfo() != null && this.getMyAuthInfo()!.isLoggedIn;
  }

  isAdmin(): boolean {
    return this.getMyAuthInfo()?.isAdmin ?? false;
  }

  isManager(): boolean {
    return this.getMyAuthInfo()?.isManager ?? false;  // Assuming isManager is stored in myAuthInfo
  }

  setLoggedInUser(x: LoginTokenDto | null) {
    if (x == null) {
      window.localStorage.setItem('my-auth-token', '');
    } else {
      window.localStorage.setItem('my-auth-token', JSON.stringify(x));
    }
    this.authState.next(x); // Notify subscribers of the state change
  }

  getLoginToken(): LoginTokenDto | null {
    let tokenString = window.localStorage.getItem('my-auth-token') ?? '';
    try {
      return JSON.parse(tokenString);
    } catch (e) {
      return null;
    }
  }

  authStateObservable(): Observable<LoginTokenDto | null> {
    return this.authState.asObservable(); // Expose the observable for other components
  }

  getUsername(): string | null {
    return this.getMyAuthInfo()?.username ?? null;
  }
}
