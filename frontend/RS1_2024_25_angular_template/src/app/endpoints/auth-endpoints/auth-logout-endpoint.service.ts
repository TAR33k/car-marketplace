import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MyConfig} from '../../my-config';
import {MyAuthService} from '../../services/auth-services/my-auth.service';
import {MyBaseEndpointAsync} from '../../helper/my-base-endpoint-async.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthLogoutEndpointService implements MyBaseEndpointAsync {
  private apiUrl = `${MyConfig.api_address}/auth/logout`;

  constructor(private httpClient: HttpClient, private authService: MyAuthService) {
  }

  handleAsync(): Observable<void> {
    return new Observable<void>((observer) => {
      this.httpClient.post<void>(this.apiUrl, {}).subscribe({
        next: () => {
          // Clear authentication data
          localStorage.clear();
          sessionStorage.clear();
          this.authService.setLoggedInUser(null);

          observer.next();
          observer.complete();

          window.location.href = '/login';
        },
        error: (error) => {
          console.error('Error during logout:', error);
          localStorage.clear();
          sessionStorage.clear();
          this.authService.setLoggedInUser(null);
          observer.error(error);
        }
      });
    });
  }
}
