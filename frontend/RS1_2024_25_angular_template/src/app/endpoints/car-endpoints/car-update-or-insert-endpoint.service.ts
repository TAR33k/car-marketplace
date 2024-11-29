import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../../my-config';

export interface CarUpdateOrInsertRequest {
  id?: number;
  name: string;
  year: number;
  engineCapacity: number;
  fuelType: string;
  transmission: string;
  doors: number;
  fuelConsumption: number;
  bodyID: number;
  cityID: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarUpdateOrInsertService {
  private readonly endpoint = `${MyConfig.api_address}/cars`;

  constructor(private http: HttpClient) {}

  handleAsync(request: CarUpdateOrInsertRequest): Observable<void> {
    return this.http.post<void>(this.endpoint, request);
  }
}
