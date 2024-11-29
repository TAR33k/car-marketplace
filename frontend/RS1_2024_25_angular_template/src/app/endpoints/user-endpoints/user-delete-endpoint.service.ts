import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../../my-config';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';

@Injectable({
  providedIn: 'root'
})
export class UserDeleteEndpointService implements MyBaseEndpointAsync<number, void> {
  private readonly endpoint = `${MyConfig.api_address}/users`; // Base endpoint for user operations

  constructor(private http: HttpClient) {}

  handleAsync(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
