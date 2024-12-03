import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface ManufacturerGetAllResponse {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  yearFounded: number;
}

@Injectable({
  providedIn: 'root'
})
export class ManufacturerGetAllEndpointService implements MyBaseEndpointAsync<void, ManufacturerGetAllResponse[]> {
  constructor(private http: HttpClient) {}

  handleAsync(): Observable<ManufacturerGetAllResponse[]> {
    return this.http.get<ManufacturerGetAllResponse[]>(`${MyConfig.api_address}/manufacturers/all`);
  }
}
