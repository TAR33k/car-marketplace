import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';
import { catchError } from 'rxjs/operators';

export interface CarImageGetByAdvertResponse {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  uploadedDate: Date;
  advertisementID: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementImagesGetByIdEndpointService implements MyBaseEndpointAsync<number, CarImageGetByAdvertResponse[]> {
  private readonly endpoint = `${MyConfig.api_address}/car-images`;

  constructor(private http: HttpClient) {}

  handleAsync(advertisementId: number): Observable<CarImageGetByAdvertResponse[]> {
    return this.http.get<CarImageGetByAdvertResponse[]>(`${this.endpoint}/by-advertisement/${advertisementId}`).pipe(
      catchError(error => {
        console.error('Error fetching advertisement images:', error);
        return throwError(() => new Error('Failed to fetch advertisement images'));
      })
    );
  }
}
