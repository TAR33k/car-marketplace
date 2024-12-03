import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface AdvertStatusUpdateRequest {
  advertisementId: number;
  newStatusId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementUpdateStatusEndpointService implements MyBaseEndpointAsync<AdvertStatusUpdateRequest, void> {
  private apiUrl = `${MyConfig.api_address}/advertisements`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: AdvertStatusUpdateRequest) {
    return this.httpClient.put<void>(`${this.apiUrl}/${request.advertisementId}/status`, { newStatusId: request.newStatusId });
  }
}
