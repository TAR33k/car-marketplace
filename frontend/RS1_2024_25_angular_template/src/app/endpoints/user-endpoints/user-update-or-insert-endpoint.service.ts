import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';
import {MyConfig} from '../../my-config';

export interface UserUpdateOrInsertRequest {
  id?: number; // Optional for insert
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  password?: string; // Optional for update
}

export interface UserUpdateOrInsertResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserUpdateOrInsertEndpointService implements MyBaseEndpointAsync<UserUpdateOrInsertRequest, UserUpdateOrInsertResponse>{
  private readonly endpoint = `${MyConfig.api_address}/users`;

  constructor(private http: HttpClient) {}

  handleAsync(request: UserUpdateOrInsertRequest): Observable<UserUpdateOrInsertResponse> {
    return this.http.post<UserUpdateOrInsertResponse>(`${this.endpoint}`, request);
  }
}
