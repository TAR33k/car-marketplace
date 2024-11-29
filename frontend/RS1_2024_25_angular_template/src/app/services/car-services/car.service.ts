import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../../my-config';

export interface SearchParams {
  make?: string;
  model?: string;
  priceMax?: number;
  category?: string;
  firstRegistrationFrom?: string;
  mileageTo?: number;
  fuelType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = `${MyConfig.api_address}/car`;  // Updated to match your endpoint pattern

  constructor(private http: HttpClient) {}

  searchCars(params: SearchParams): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, { params: { ...params } as any });
  }

  getCarMakes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/makes`);
  }

  getCarModels(make: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/models`, { params: { make } });
  }
}
