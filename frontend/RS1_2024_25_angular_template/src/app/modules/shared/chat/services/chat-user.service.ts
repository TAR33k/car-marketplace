import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import { MyConfig } from '../../../../my-config';
import { ChatUser } from '../models/chat.model';
import { throwError } from 'rxjs';
import {MyAuthService} from '../../../../services/auth-services/my-auth.service';
import {ChatService} from './chat.service';


@Injectable({
  providedIn: 'root'
})
export class ChatUserService {
  constructor(
    private http: HttpClient,
    private authService: MyAuthService,
    private chatService: ChatService
  ) {}

  getAvailableUsers(): Observable<ChatUser[]> {
    const authInfo = this.authService.getMyAuthInfo();

    return this.http.get<ChatUser[]>(`${MyConfig.api_address}/users/all`).pipe(
      switchMap(users => {
        return this.http.get<any[]>(`${MyConfig.api_address}/users/status`).pipe(
          map(statuses => {
            const statusMap = new Map(statuses.map(s => [s.userId, s]));

            return users
              .filter(user => user.id !== authInfo?.userId)
              .map(user => {
                const status = statusMap.get(user.id);
                let lastSeen: Date | undefined;

                if (status?.lastSeen) {
                  try {
                    const lastSeenStr = status.lastSeen.endsWith('Z')
                      ? status.lastSeen
                      : status.lastSeen + 'Z';
                    lastSeen = new Date(lastSeenStr);

                    if (isNaN(lastSeen.getTime())) {
                      lastSeen = new Date();
                    }
                  } catch {
                    lastSeen = new Date();
                  }
                }

                return {
                  ...user,
                  isOnline: status?.isOnline ?? false,
                  lastSeen: lastSeen
                };
              });
          })
        );
      }),
      tap(users => this.chatService.updateUsers(users)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Error loading users: ' + error.message));
  }
}
