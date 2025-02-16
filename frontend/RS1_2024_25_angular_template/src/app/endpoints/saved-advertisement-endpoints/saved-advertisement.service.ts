import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyConfig } from '../../my-config';

export interface SavedAdvertisementResponse {
  id: number;
  advertisementID: number;
  title: string;
  price: number;
  carName: string;
  primaryImageUrl?: string;
  savedDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SavedAdvertisementService {
  private readonly apiUrl = `${MyConfig.api_address}/saved-advertisements`;

  constructor(private http: HttpClient) {}

  getSavedAdvertisements(): Observable<SavedAdvertisementResponse[]> {
    return this.http.get<SavedAdvertisementResponse[]>(this.apiUrl);
  }

  addSavedAdvertisement(advertisementId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${advertisementId}`, {});
  }

  removeSavedAdvertisement(advertisementId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${advertisementId}`);
  }

  isSaved(advertisementId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${advertisementId}`);
  }
}
