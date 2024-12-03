import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { MyBaseEndpointAsync } from '../../helper/my-base-endpoint-async.interface';

export interface CarImageBulkUploadResponse {
  uploadedImages: {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    uploadedDate: Date;
  }[];
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CarImageBulkUploadEndpointService implements MyBaseEndpointAsync<FormData, CarImageBulkUploadResponse> {
  private apiUrl = `${MyConfig.api_address}/car-images/bulk`;

  constructor(private httpClient: HttpClient) { }

  handleAsync(formData: FormData) {
    return this.httpClient.post<CarImageBulkUploadResponse>(this.apiUrl, formData);
  }
}
