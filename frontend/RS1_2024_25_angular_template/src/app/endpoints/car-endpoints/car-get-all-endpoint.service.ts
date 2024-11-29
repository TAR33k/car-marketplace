import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../../my-config';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';


export interface CarGetAllResponse {
  id: number;
  name: string;
  year: number;
  engineCapacity: number;
  fuelType: string;
  transmission: string;
  doors: number;
  fuelConsumption: number;
  bodyID: number;
  bodyType?: {
    id: number;
    name: string;
  };
  cityID: number;
  city?: {
    id: number;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CarGetAllService implements MyBaseEndpointAsync<void, CarGetAllResponse[]> {
  private readonly endpoint = `${MyConfig.api_address}/cars/filter`;

  constructor(private http: HttpClient) {}

  handleAsync(): Observable<CarGetAllResponse[]> {
    return this.http.get<CarGetAllResponse[]>(this.endpoint);
  }
}
