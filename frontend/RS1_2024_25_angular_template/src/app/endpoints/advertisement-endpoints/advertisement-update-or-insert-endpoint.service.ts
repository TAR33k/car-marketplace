import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface AdvertUpdateOrInsertRequest {
  ID?: number;  // Capital ID to match API
  Title: string;
  Description?: string;
  Condition: number;
  Price: number;
  CarID: number;  // Capital ID to match API
  ExpirationDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementUpdateOrInsertEndpointService implements MyBaseEndpointAsync<AdvertUpdateOrInsertRequest, any> {
  private apiUrl = `${MyConfig.api_address}/advertisements`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: AdvertUpdateOrInsertRequest) {
    return this.httpClient.post<any>(this.apiUrl, request);
  }
}
