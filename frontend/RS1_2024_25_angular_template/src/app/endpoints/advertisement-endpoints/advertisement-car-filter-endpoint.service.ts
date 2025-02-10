import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyPagedList } from '../../helper/my-paged-request';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { FuelType, TransmissionType, VehicleCondition } from '../../services/car-services/car-enums';

export interface AdvertGetAllRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: VehicleCondition;
  make?: string;
  model?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  yearFrom?: number;
  yearTo?: number;
  bodyTypeId?: number;
  mileageTo?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'views';
  statusId?: number;
}

export interface AdvertGetAllResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: VehicleCondition;
  listingDate: Date;
  expirationDate?: Date;
  viewCount: number;
  statusId: number;
  statusName: string;
  primaryImageUrl?: string;
  images: string[];

  // Car details
  carId: number;
  carName: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  bodyType: string;

  // User details
  userId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
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
export class AdvertisementCarFilterEndpointService implements MyBaseEndpointAsync<AdvertGetAllRequest, PagedAdvertResponse> {
  private readonly apiUrl = `${MyConfig.api_address}/advertisements/filter`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(request: AdvertGetAllRequest) {
    let params = new HttpParams();

    // Add all parameters using a helper method
    params = this.addParamsFromObject(params, {
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
      searchTerm: request.searchTerm,
      condition: request.condition,
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
      statusId: request.statusId,
      make: request.make,
      model: request.model,
      fuelType: request.fuelType,
      transmission: request.transmission,
      yearFrom: request.yearFrom,
      yearTo: request.yearTo,
      bodyTypeId: request.bodyTypeId,
      mileageTo: request.mileageTo,
      sortBy: request.sortBy
    });

    return this.httpClient.get<PagedAdvertResponse>(this.apiUrl, { params });
  }

  private addParamsFromObject(params: HttpParams, obj: Record<string, any>): HttpParams {
    Object.entries(obj).forEach(([key, value]) => {
      if (this.isValidParam(value)) {
        params = params.set(key, value.toString());
      }
    });
    return params;
  }

  private isValidParam(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && !value.trim()) return false;
    if (typeof value === 'number' && isNaN(value)) return false;
    return true;
  }
}
