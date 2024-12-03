import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export enum FeaturedType {
  MostViewed = 'MostViewed',
  Newest = 'Newest',
  PriceHighToLow = 'PriceHighToLow',
  PriceLowToHigh = 'PriceLowToHigh'
}

export interface AdvertGetFeaturedRequest {
  featuredType: FeaturedType;
  count: number;
}

export interface AdvertGetFeaturedResponse {
  id: number;
  title: string;
  price: number;
  listingDate: Date;
  viewCount: number;
  condition: string;
  carName: string;
  userName: string;
  primaryImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementGetFeaturedEndpointService implements MyBaseEndpointAsync<AdvertGetFeaturedRequest, AdvertGetFeaturedResponse[]> {
  private apiUrl = `${MyConfig.api_address}/advertisements/featured`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: AdvertGetFeaturedRequest) {
    return this.httpClient.get<AdvertGetFeaturedResponse[]>(`${this.apiUrl}`, {
      params: {
        featuredType: request.featuredType,
        count: request.count.toString()
      }
    });
  }
}
