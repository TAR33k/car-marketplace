import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface CarImageUploadResponse {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  uploadedDate: Date;
  advertisementId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarImageUploadEndpointService implements MyBaseEndpointAsync<FormData, CarImageUploadResponse> {
  private apiUrl = `${MyConfig.api_address}/car-images/upload`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(formData: FormData) {
    return this.httpClient.post<CarImageUploadResponse>(this.apiUrl, formData);
  }
}
