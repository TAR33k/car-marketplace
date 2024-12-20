import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${MyConfig.api_address}/auth`;

  constructor(private http: HttpClient) {}

  checkUsernameAvailability(username: string): Observable<{ isAvailable: boolean }> {
    return this.http.get<{ isAvailable: boolean }>(`${this.apiUrl}/check-username?username=${username}`);
  }

  // Register a new user
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

}
