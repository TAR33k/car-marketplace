import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyAuthService } from '../../services/auth-services/my-auth.service';

export interface RegisterRequest {
  name: string;
  surname: string;
  phoneNumber: string;
  address: string;
  emailAddress: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  myAuthInfo?: {
    userId: number;
    username: string;
    isAdmin: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${MyConfig.api_address}/auth`;

  constructor(private http: HttpClient, private myAuthService: MyAuthService) {}

  checkUsernameAvailability(username: string): Observable<{ isAvailable: boolean }> {
    return this.http.get<{ isAvailable: boolean }>(`${this.apiUrl}/check-username?username=${username}`);
  }

  // Register a new user
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return new Observable<RegisterResponse>((observer) => {
      this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).subscribe({
        next: (response) => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('username', response.myAuthInfo?.username || '');
            localStorage.setItem('isAdmin', JSON.stringify(response.myAuthInfo?.isAdmin || false));

            if (response.myAuthInfo?.userId) {
              localStorage.setItem('userId', response.myAuthInfo.userId.toString());
            }

            this.myAuthService.setLoggedInUser(response.token);
          }

          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Registration error:', error);
          observer.error(error);
        }
      });
    });
  }
}
