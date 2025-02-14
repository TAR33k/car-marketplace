import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, delay, finalize } from 'rxjs/operators';
import { MyConfig } from '../../my-config';
import { MyAuthService } from '../../services/auth-services/my-auth.service';
import { LoginTokenDto } from '../../services/auth-services/dto/login-token-dto';
import { Router } from '@angular/router';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import {ChatService} from '../../modules/shared/chat/services/chat.service';

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthLoginEndpointService implements MyBaseEndpointAsync<LoginRequest, LoginTokenDto> {
  private apiUrl = `${MyConfig.api_address}/auth/login`;
  private isLoggingIn = false;

  constructor(
    private httpClient: HttpClient,
    private myAuthService: MyAuthService,
    private router: Router,
    private chatService: ChatService
  ) {}

  handleAsync(request: LoginRequest): Observable<LoginTokenDto> {
    if (this.isLoggingIn) {
      return throwError(() => new Error('Login already in progress'));
    }

    this.isLoggingIn = true;

    return this.httpClient.post<LoginTokenDto>(`${this.apiUrl}`, request).pipe(
      tap((response) => {
        localStorage.clear();

        const userInfo = response.myAuthInfo;
        if (userInfo) {
          this.storeAuthData(response);
          this.myAuthService.setLoggedInUser({
            token: response.token,
            myAuthInfo: response.myAuthInfo
          });
        }
      }),
      delay(100),
      tap(async (response) => {
        // Initialize chat service before navigation
        await this.chatService.initializeChat();
        this.handleNavigation(response.myAuthInfo?.isAdmin);
      }),
      finalize(() => {
        this.isLoggingIn = false;
      })
    );
  }

  private storeAuthData(response: LoginTokenDto): void {
    const userInfo = response.myAuthInfo;
    if (userInfo) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('username', userInfo.username);
      localStorage.setItem('isAdmin', JSON.stringify(userInfo.isAdmin));

      if (userInfo.userId) {
        localStorage.setItem('userId', userInfo.userId.toString());
      }
    }
  }

  private handleNavigation(isAdmin: boolean | undefined): void {
    try {
      const targetRoute = isAdmin ? '/admin-dashboard' : '/landing-page';

      this.router.navigate([targetRoute]);
    } catch (error) {
      console.error('Navigation error:', error);
      this.router.navigate(['/']);
    }
  }


}
