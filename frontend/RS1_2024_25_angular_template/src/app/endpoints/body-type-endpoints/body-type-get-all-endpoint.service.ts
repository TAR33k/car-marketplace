import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyConfig} from '../../my-config';

@Injectable({
  providedIn: 'root'
})
export class BodyTypeGetAllEndpointService {
  private readonly endpoint = `${MyConfig.api_address}`;

  constructor(private http: HttpClient) {}

  handleAsync(): Observable<BodyTypeGetAllResponse[]> {
    return this.http.get<BodyTypeGetAllResponse[]>(`${this.endpoint}/body-types/all`);
  }
}

export interface BodyTypeGetAllResponse {
  id: number;
  name: string;
}
