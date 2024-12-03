import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedRequest } from '../../helper/my-paged-request';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface AdvertGetByUserRequest extends MyPagedRequest {
  statusId?: number;
}

export interface AdvertGetByUserResponse {
  id: number;
  title: string;
  condition: string;
  price: number;
  listingDate: Date;
  expirationDate?: Date;
  viewCount: number;
  status: string;
  carName: string;
  primaryImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementGetByUserEndpointService implements MyBaseEndpointAsync<AdvertGetByUserRequest, AdvertGetByUserResponse[]> {
  private apiUrl = `${MyConfig.api_address}/advertisements/my`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: AdvertGetByUserRequest) {
    const params = buildHttpParams(request);
    return this.httpClient.get<AdvertGetByUserResponse[]>(`${this.apiUrl}`, { params });
  }
}
