import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthLoginEndpointService, LoginRequest } from '../../../endpoints/auth-endpoints/auth-login-endpoint.service';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginRequest: LoginRequest = { username: 'admin1', password: 'admin1' };
  errorMessage: string | null = null;

  constructor(
    private authLoginService: AuthLoginEndpointService,
    private router: Router,
    private authService: MyAuthService
  ) {}

  onLogin(): void {
    this.authLoginService.handleAsync(this.loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful');
        setTimeout(() => {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/public']);
          }
        }, 100);
      },
      error: (error: any) => {
        this.errorMessage = 'Incorrect username or password';
        console.error('Login error:', error);
      }
    });
  }
}
