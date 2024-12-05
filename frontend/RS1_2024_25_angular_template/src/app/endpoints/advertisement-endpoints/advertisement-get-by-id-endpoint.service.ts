import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface AdvertImageResponse {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface AdvertGetByIdResponse {
  id: number;
  title: string;
  description: string;
  condition: string;
  price: number;
  listingDate: string;  // Date as string
  expirationDate?: string;  // Date as string, optional
  viewCount: number;
  status: string;
  carID: number;
  carName: string;
  userID: number;
  userName: string;
  images: AdvertImageResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementGetByIdEndpointService implements MyBaseEndpointAsync<number, AdvertGetByIdResponse> {
  private apiUrl = `${MyConfig.api_address}/advertisements`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(id: number) {
    return this.httpClient.get<AdvertGetByIdResponse>(`${this.apiUrl}/${id}`);
  }
}
