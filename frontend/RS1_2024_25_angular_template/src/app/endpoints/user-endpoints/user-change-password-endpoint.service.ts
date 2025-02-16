import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../../my-config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserChangePasswordEndpointService {
  constructor(private http: HttpClient) {}

  handleAsync(request: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post(
      `${MyConfig.api_address}/users/change-password`,
      request
    );
  }
}
