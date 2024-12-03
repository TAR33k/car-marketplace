import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface CarModelGetByManufacturerResponse {
  id: number;
  name: string;
  description?: string;
  startYear: number;
  endYear?: number;
  manufacturerId: number;
  manufacturerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarModelGetByManufacturerEndpointService implements MyBaseEndpointAsync<number, CarModelGetByManufacturerResponse[]> {
  constructor(private http: HttpClient) {}

  handleAsync(manufacturerId: number): Observable<CarModelGetByManufacturerResponse[]> {
    return this.http.get<CarModelGetByManufacturerResponse[]>(`${MyConfig.api_address}/car-models/by-manufacturer/${manufacturerId}`);
  }
}
