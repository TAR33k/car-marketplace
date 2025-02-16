import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface ProfileGetActivityResponse {
  type: string;
  description: string;
  date: Date;
  relatedId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileGetActivityEndpointService implements MyBaseEndpointAsync<number, ProfileGetActivityResponse[]> {
  private readonly endpoint = `${MyConfig.api_address}/profile`;

  constructor(private http: HttpClient) {}

  handleAsync(userId: number): Observable<ProfileGetActivityResponse[]> {
    return this.http.get<ProfileGetActivityResponse[]>(`${this.endpoint}/${userId}/activity`);
  }
}
