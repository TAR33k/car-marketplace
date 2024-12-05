import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface StatusTypeGetAllResponse {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusTypeGetAllEndpointService implements MyBaseEndpointAsync<void, StatusTypeGetAllResponse[]> {
  private apiUrl = `${MyConfig.api_address}/status-types`;

  constructor(private httpClient: HttpClient) { }

  handleAsync() {
    return this.httpClient.get<StatusTypeGetAllResponse[]>(this.apiUrl);
  }
}
