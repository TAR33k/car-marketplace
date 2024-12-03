import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { FuelType, TransmissionType } from '../../services/car-services/car-enums';

export interface CarUpdateOrInsertRequest {
  id?: number;
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
  bodyID: number;
  cityID: number;
  modelID: number;
}

export interface CarUpdateOrInsertResponse {
  id: number;
  name: string;
  year: number;
  engineCapacity: number;
  fuelType: number;
  transmission: number;
  doors: number;
  fuelConsumption: number;
  mileage: number;
  color: string;
  hasServiceHistory: boolean;
  bodyID: number;
  cityID: number;
  modelID: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarUpdateOrInsertEndpointService implements MyBaseEndpointAsync<CarUpdateOrInsertRequest, CarUpdateOrInsertResponse> {
  private readonly endpoint = `${MyConfig.api_address}/cars`;

  constructor(private http: HttpClient) {}

  handleAsync(request: CarUpdateOrInsertRequest): Observable<CarUpdateOrInsertResponse> {
    return this.http.post<CarUpdateOrInsertResponse>(this.endpoint, request);
  }
}
