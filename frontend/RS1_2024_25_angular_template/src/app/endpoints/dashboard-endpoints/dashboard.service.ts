import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface DashboardAnalyticsResponse {
  userStats: UserStatistics;
  advertStats: AdvertisementStatistics;
  vehicleStats: VehicleStatistics;
  manufacturerStats: ManufacturerStatistics[];
  viewStats: ViewStatistics[];
  priceRangeDistribution: PriceRangeStats[];
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}

export interface AdvertisementStatistics {
  totalAdvertisements: number;
  activeAdvertisements: number;
  newAdvertisementsToday: number;
  newAdvertisementsThisWeek: number;
  newAdvertisementsThisMonth: number;
  averagePrice: number;
  totalViews: number;
}

export interface VehicleStatistics {
  totalCars: number;
  byFuelType: FuelTypeStats[];
  byTransmission: TransmissionStats[];
  averageYear: number;
  averageMileage: number;
}

export interface FuelTypeStats {
  type: string;
  count: number;
}

export interface TransmissionStats {
  type: string;
  count: number;
}

export interface ManufacturerStatistics {
  name: string;
  country: string;
  totalCars: number;
  averagePrice: number;
  popularModels: ModelStats[];
}

export interface ModelStats {
  name: string;
  count: number;
}

export interface ViewStatistics {
  advertisementId: number;
  title: string;
  viewCount: number;
  price: number;
  listingDate: Date;
}

export interface PriceRangeStats {
  range: string;
  count: number;
  averagePrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardAnalyticsService implements MyBaseEndpointAsync<void, DashboardAnalyticsResponse> {
  constructor(private http: HttpClient) {}

  handleAsync(): Observable<DashboardAnalyticsResponse> {
    return this.http.get<DashboardAnalyticsResponse>(`${MyConfig.api_address}/dashboard/analytics`);
  }
}
