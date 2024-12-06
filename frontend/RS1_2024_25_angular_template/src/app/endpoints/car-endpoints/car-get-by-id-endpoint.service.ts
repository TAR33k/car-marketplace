import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { FuelType, TransmissionType } from '../../services/car-services/car-enums';

export interface CarGetByIdResponse {
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
  bodyType: {
    id: number;
    name: string;
  };
  location: {
    cityID: number;
    cityName: string;
    countryName: string;
  };
  model: {
    id: number;
    name: string;
    manufacturer: {
      id: number;
      name: string;
      country: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class CarGetByIdEndpointService implements MyBaseEndpointAsync<number, CarGetByIdResponse> {
  private readonly endpoint = `${MyConfig.api_address}/cars`;

  constructor(private http: HttpClient) {}

  handleAsync(id: number): Observable<CarGetByIdResponse> {
    return this.http.get<CarGetByIdResponse>(`${this.endpoint}/${id}`);
  }
}
