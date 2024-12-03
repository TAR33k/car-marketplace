import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface CarModelGetAllResponse {
  id: number;
  name: string;
  description?: string;
  startYear: number;
  endYear?: number;
  manufacturerId: number;
  manufacturerName: string;
  manufacturerCountry?: string;
  manufacturerLogo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarModelGetAllEndpointService implements MyBaseEndpointAsync<void, CarModelGetAllResponse[]> {
  constructor(private http: HttpClient) {}

  handleAsync(): Observable<CarModelGetAllResponse[]> {
    return this.http.get<CarModelGetAllResponse[]>(`${MyConfig.api_address}/car-models/all`);
  }
}
