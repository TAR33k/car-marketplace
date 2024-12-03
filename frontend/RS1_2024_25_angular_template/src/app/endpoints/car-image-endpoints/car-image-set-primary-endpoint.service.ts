import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface SetPrimaryRequest {
  imageId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarImageSetPrimaryEndpointService implements MyBaseEndpointAsync<SetPrimaryRequest, void> {
  private apiUrl = `${MyConfig.api_address}/car-images/set-primary`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: SetPrimaryRequest) {
    return this.httpClient.put<void>(this.apiUrl, request);
  }
}
