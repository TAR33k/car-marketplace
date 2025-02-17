import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyConfig } from '../../my-config';

export interface UserSettingsRequest {
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
}

export interface UserSettingsSetResponse {
  id: number;
  user: User;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsSetEndpointService implements MyBaseEndpointAsync<UserSettingsRequest, UserSettingsSetResponse> {
  private readonly endpoint = `${MyConfig.api_address}/settings`;

  constructor(private http: HttpClient) {}

  handleAsync(request: UserSettingsRequest): Observable<UserSettingsSetResponse> {
    return this.http.post<UserSettingsSetResponse>(this.endpoint, request);
  }
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  isAdmin: boolean;
  lastSeen?: Date;
  createdAt?: Date;
  passwordHash: string;
}
