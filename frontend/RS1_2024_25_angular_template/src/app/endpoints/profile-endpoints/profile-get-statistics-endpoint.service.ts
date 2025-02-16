import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface AdvertPerformance {
  title: string;
  views: number;
  saveCount: number;
  status: string;
}

export interface ProfileGetStatisticsResponse {
  totalAdvertisements: number;
  activeAdvertisements: number;
  totalViews: number;
  totalSold: number;
  topPerformingAds: AdvertPerformance[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileGetStatisticsEndpointService implements MyBaseEndpointAsync<number, ProfileGetStatisticsResponse> {
  private readonly endpoint = `${MyConfig.api_address}/profile`;

  constructor(private http: HttpClient) {}

  handleAsync(userId: number): Observable<ProfileGetStatisticsResponse> {
    return this.http.get<ProfileGetStatisticsResponse>(`${this.endpoint}/${userId}/statistics`);
  }
}
