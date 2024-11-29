import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../../my-config';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';

export interface UserGetAllResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserGetAllEndpointService implements MyBaseEndpointAsync<void, UserGetAllResponse[]> {
  private readonly endpoint = `${MyConfig.api_address}/users/all`;

  constructor(private http: HttpClient) {}

  handleAsync(): Observable<UserGetAllResponse[]> {
    return this.http.get<UserGetAllResponse[]>(this.endpoint);
  }
}
