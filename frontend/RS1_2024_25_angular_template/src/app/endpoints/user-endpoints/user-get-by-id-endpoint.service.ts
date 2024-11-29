import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';
import {MyConfig} from '../../my-config';

export interface UserGetByIdResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  isAdmin: boolean;
  passwordHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserGetByIdEndpointService implements MyBaseEndpointAsync<number, UserGetByIdResponse> {
  private readonly endpoint = `${MyConfig.api_address}/users`;

  constructor(private http: HttpClient) {}

  handleAsync(id: number): Observable<UserGetByIdResponse> {
    return this.http.get<UserGetByIdResponse>(`${this.endpoint}/${id}`);
  }
}
