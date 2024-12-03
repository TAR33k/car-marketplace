import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedList, MyPagedRequest } from '../../helper/my-paged-request';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { VehicleCondition } from '../../services/car-services/car-enums';

export interface AdvertGetAllRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  condition?: VehicleCondition;
  minPrice?: number;
  maxPrice?: number;
  statusId?: number;
}

export interface AdvertGetAllResponse {
  id: number;
  title: string;
  condition: VehicleCondition;
  price: number;
  listingDate: Date;
  expirationDate?: Date;
  viewCount: number;
  status: string;
  carName: string;
  userName: string;
  primaryImageUrl?: string;
}

export interface PagedAdvertResponse extends MyPagedList<AdvertGetAllResponse> {
  dataItems: AdvertGetAllResponse[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementGetAllEndpointService implements MyBaseEndpointAsync<AdvertGetAllRequest, PagedAdvertResponse> {
  private apiUrl = `${MyConfig.api_address}/advertisements`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: AdvertGetAllRequest) {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    // Only add optional parameters if they have actual values
    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }

    // Only add condition if it's a number (enum value)
    if (typeof request.condition === 'number') {
      params = params.set('condition', request.condition.toString());
    }

    if (typeof request.minPrice === 'number') {
      params = params.set('minPrice', request.minPrice.toString());
    }

    if (typeof request.maxPrice === 'number') {
      params = params.set('maxPrice', request.maxPrice.toString());
    }

    if (typeof request.statusId === 'number') {
      params = params.set('statusId', request.statusId.toString());
    }

    return this.httpClient.get<PagedAdvertResponse>(this.apiUrl, { params });
  }
}
