import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { jwtDecode } from 'jwt-decode';
import {ChatService} from '../../modules/shared/chat/services/chat.service';

export interface MyAuthInfo {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isManager: boolean;
  isLoggedIn: boolean;
  slikaPath?: string;
}

export interface LoginTokenDto {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class MyAuthService {
  private authState = new BehaviorSubject<MyAuthInfo | null>(null);
  private apiUrl = `${MyConfig.api_address}/auth`;

  constructor(private http: HttpClient) {
    const storedToken = this.getLoginToken();
    if (storedToken) {
      this.setLoggedInUser(storedToken);
    }
  }

  getMyAuthInfo(): MyAuthInfo | null {
    return this.authState.getValue();
  }

  isLoggedIn(): boolean {
    return this.getLoginToken() !== null;
  }

  isAdmin(): boolean {
    return this.getMyAuthInfo()?.isAdmin ?? false;
  }

  isManager(): boolean {
    return this.getMyAuthInfo()?.isManager ?? false;
  }

  getUsername(): string | null {
    return this.getMyAuthInfo()?.username ?? null;
  }

  setLoggedInUser(token: string | null) {
    if (!token) {
      localStorage.removeItem('my-auth-token');
      this.authState.next(null);
      return;
    }

    localStorage.setItem('my-auth-token', token);
    const decodedToken = this.decodeToken(token);
    if (decodedToken) {
      this.authState.next(decodedToken);
    }
  }

  getLoginToken(): string | null {
    return localStorage.getItem('my-auth-token');
  }

  private decodeToken(token: string): MyAuthInfo | null {
    try {
      const decoded = jwtDecode<any>(token);
      return {
        userId: parseInt(decoded.UserId, 10),
        username: decoded.Username,
        firstName: decoded.FirstName,
        lastName: decoded.LastName,
        isAdmin: decoded.IsAdmin === true || decoded.IsAdmin === "True",
        isManager: decoded.IsManager === true || decoded.IsManager === "True",
        isLoggedIn: true,
        slikaPath: decoded.SlikaPath ?? null,
      };
    } catch (e) {
      console.error("Invalid token format", e);
      return null;
    }
  }

  hasValidStoredSession(): boolean {
    return this.isLoggedIn() && this.authState.getValue() !== null;
  }

  authStateObservable(): Observable<MyAuthInfo | null> {
    return this.authState.asObservable();
  }
}
