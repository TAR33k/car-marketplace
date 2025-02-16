import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedList, MyPagedRequest } from '../../helper/my-paged-request';
import { buildHttpParams } from '../../helper/http-params.helper';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { VehicleCondition } from '../../services/car-services/car-enums';

export interface AdvertGetByUserResponse {
  id: number;
  title: string;
  condition: VehicleCondition;
  price: number;
  listingDate: Date;
  expirationDate?: Date;
  viewCount: number;
  status: string;
  carName: string;
  primaryImageUrl?: string;
}

export interface PagedAdvertResponse extends MyPagedList<AdvertGetByUserResponse> {
  dataItems: AdvertGetByUserResponse[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementGetByUserEndpointService implements MyBaseEndpointAsync<AdvertGetByUserRequest, PagedAdvertResponse> {
  private readonly apiUrl = `${MyConfig.api_address}/advertisements`;

  constructor(private httpClient: HttpClient) {}

  handleAsync(request: AdvertGetByUserRequest) {
    const { userID, statusID, ...pageParams } = request;
    const params = buildHttpParams({
      ...pageParams,
      statusID: statusID
    });

    return this.httpClient.get<PagedAdvertResponse>(
      `${this.apiUrl}/user/${userID}`,
      { params }
    );
  }
}

export interface AdvertGetByUserRequest extends MyPagedRequest {
  userID: number;
  statusID?: number;
}
