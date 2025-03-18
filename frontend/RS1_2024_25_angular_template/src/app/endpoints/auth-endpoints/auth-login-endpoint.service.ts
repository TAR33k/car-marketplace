import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, delay, finalize } from 'rxjs/operators';
import { MyConfig } from '../../my-config';
import { MyAuthService } from '../../services/auth-services/my-auth.service';
import { Router } from '@angular/router';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { ChatService } from '../../modules/shared/chat/services/chat.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthLoginEndpointService implements MyBaseEndpointAsync<LoginRequest, LoginResponse> {
  private apiUrl = `${MyConfig.api_address}/auth/login`;
  private isLoggingIn = false;

  constructor(
    private httpClient: HttpClient,
    private myAuthService: MyAuthService,
    private router: Router,
    private chatService: ChatService
  ) {}

  handleAsync(request: LoginRequest): Observable<LoginResponse> {
    if (this.isLoggingIn) {
      return throwError(() => new Error('Login already in progress'));
    }

    this.isLoggingIn = true;

    return this.httpClient.post<LoginResponse>(this.apiUrl, request).pipe(
      tap((response) => {
        localStorage.clear();
        this.storeAuthData(response.token);
        this.myAuthService.setLoggedInUser(response.token);
      }),
      delay(100),
      tap(async () => {
        await this.chatService.initializeChat();
        this.handleNavigation();
      }),
      finalize(() => {
        this.isLoggingIn = false;
      })
    );
  }

  private storeAuthData(token: string): void {
    localStorage.setItem('my-auth-token', token);
  }

  private handleNavigation(): void {
    const isAdmin = this.myAuthService.isAdmin();
    const targetRoute = isAdmin ? '/admin-dashboard' : '/landing-page';
    this.router.navigate([targetRoute]).catch(error => {
      console.error('Navigation error:', error);
      this.router.navigate(['/']);
    });
  }
}
