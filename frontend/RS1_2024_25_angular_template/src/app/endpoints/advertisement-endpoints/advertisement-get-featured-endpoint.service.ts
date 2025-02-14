import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import {VehicleCondition} from '../../services/car-services/car-enums';

export enum FeaturedType {
  MostViewed = 0,
  Newest = 1,
  PriceHighToLow = 2,
  PriceLowToHigh = 3
}

export interface AdvertGetFeaturedRequest {
  featuredType: FeaturedType;
  count: number;
  page: number;
}

export interface AdvertGetFeaturedResponse {
  id: number;
  title: string;
  price: number;
  listingDate: string;
  viewCount: number;
  condition: VehicleCondition;
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
        featuredType: FeaturedType[request.featuredType],
        count: request.count.toString(),
        page: request.page.toString()
      }
    });
  }
}
