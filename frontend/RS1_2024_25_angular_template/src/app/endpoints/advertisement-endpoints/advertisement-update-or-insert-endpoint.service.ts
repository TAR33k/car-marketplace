import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { VehicleCondition } from '../../services/car-services/car-enums';

export interface AdvertUpdateOrInsertRequest {
  ID?: number;  // Match backend casing
  Title: string;
  Description: string;
  Condition: VehicleCondition;  // Change to enum
  Price: number;
  ExpirationDate?: Date;
  CarID: number;  // Match backend casing
}

export interface AdvertUpdateOrInsertResponse {
  ID: number;
  Title: string;
  Description: string;
  Condition: VehicleCondition;  // Change to enum
  Price: number;
  ListingDate: Date;
  ExpirationDate?: Date;
  CarID: number;
  StatusID: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementUpdateOrInsertEndpointService implements MyBaseEndpointAsync<AdvertUpdateOrInsertRequest, AdvertUpdateOrInsertResponse> {
  private apiUrl = `${MyConfig.api_address}/advertisements`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: AdvertUpdateOrInsertRequest) {
    return this.httpClient.post<AdvertUpdateOrInsertResponse>(`${this.apiUrl}`, request);
  }
}
