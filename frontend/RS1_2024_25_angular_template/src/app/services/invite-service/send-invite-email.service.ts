import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { MyConfig } from '../../my-config';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SendInviteEmailService {
  private apiUrl = `${MyConfig.api_address}/auth`;

  constructor(private http: HttpClient) {}

  sendInviteEmail(email: string): Observable<any> {
    const token = localStorage.getItem('my-auth-token'); // Dohvati token iz localStorage-a

    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'my-auth-token': token // Dodaj token u header
    });

    const requestBody = { email };

    return this.http.post(`${this.apiUrl}/send-invite`, requestBody, { headers })
      .pipe(
        catchError(error => {
          console.error('Error sending invite:', error);
          return throwError(() => error);
        })
      );
  }
}
