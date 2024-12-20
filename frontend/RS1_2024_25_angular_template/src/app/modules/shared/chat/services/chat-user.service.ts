import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MyConfig } from '../../../../my-config';
import { ChatUser } from '../models/chat.model';
import { throwError } from 'rxjs';
import {MyAuthService} from '../../../../services/auth-services/my-auth.service';


@Injectable({
    providedIn: 'root'
})
export class ChatUserService {
  constructor(
    private http: HttpClient,
    private authService: MyAuthService // Add this dependency
  ) {}

    getAvailableUsers(): Observable<ChatUser[]> {
      const authInfo = this.authService.getMyAuthInfo();
      return this.http.get<ChatUser[]>(`${MyConfig.api_address}/users/all`)
        .pipe(
          map(users => users.filter(user => user.id !== authInfo?.userId)),
          catchError(this.handleError)
        );
    }

    private handleError(error: any) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Error loading users: ' + error.message));
    }
}
