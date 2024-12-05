import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { MyPagedList, MyPagedRequest } from '../../helper/my-paged-request';
import { FuelType, TransmissionType } from '../../services/car-services/car-enums';

export interface CarGetAllRequest extends MyPagedRequest {
  searchTerm?: string;
  manufacturerId?: number;
  modelId?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  minMileage?: number;
  maxMileage?: number;
}

export interface CarGetAllResponse {
  id: number;
  name: string;
  year: number;
  engineCapacity: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  doors: number;
  fuelConsumption: number;
  mileage: number;
  color: string;
  hasServiceHistory: boolean;
  bodyTypeName: string;
  cityName: string;
  countryName: string;
  modelName: string;
  manufacturerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarGetAllEndpointService implements MyBaseEndpointAsync<CarGetAllRequest, MyPagedList<CarGetAllResponse>> {
  private readonly endpoint = `${MyConfig.api_address}/cars`;

  constructor(private http: HttpClient) {}

  handleAsync(request: CarGetAllRequest): Observable<MyPagedList<CarGetAllResponse>> {
    let params = new HttpParams();

    // Only add parameters if they have valid values
    if (request.pageNumber) {
      params = params.set('pageNumber', request.pageNumber.toString());
    }
    if (request.pageSize) {
      params = params.set('pageSize', request.pageSize.toString());
    }
    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }
    if (request.manufacturerId) {
      params = params.set('manufacturerId', request.manufacturerId.toString());
    }
    if (request.modelId) {
      params = params.set('modelId', request.modelId.toString());
    }
    if (request.minYear !== null && request.minYear !== undefined) {
      params = params.set('minYear', request.minYear.toString());
    }
    if (request.maxYear !== null && request.maxYear !== undefined) {
      params = params.set('maxYear', request.maxYear.toString());
    }
    if (request.fuelType !== null && request.fuelType !== undefined) {
      params = params.set('fuelType', request.fuelType.toString());
    }
    if (request.transmission !== null && request.transmission !== undefined) {
      params = params.set('transmission', request.transmission.toString());
    }
    if (request.minMileage !== null && request.minMileage !== undefined) {
      params = params.set('minMileage', request.minMileage.toString());
    }
    if (request.maxMileage !== null && request.maxMileage !== undefined) {
      params = params.set('maxMileage', request.maxMileage.toString());
    }

    return this.http.get<MyPagedList<CarGetAllResponse>>(this.endpoint, { params });
  }
}
