import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import { SettingsGetEndpointService } from '../../../endpoints/settings-endpoints/settings-get-endpoint.service';
import { SettingsSetEndpointService } from '../../../endpoints/settings-endpoints/settings-set-endpoint.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  isAuthorized = false;
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: MyAuthService,
    private settingsGetEndpoint: SettingsGetEndpointService,
    private settingsSetEndpoint: SettingsSetEndpointService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      showEmail: [false],
      showPhone: [false],
      showLocation: [false]
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getMyAuthInfo();

    if (!currentUser?.isLoggedIn) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    this.userId = currentUser.userId;
    this.isAuthorized = true;
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsGetEndpoint.handleAsync().subscribe({
      next: (response) => {
        this.settingsForm.patchValue({
          showEmail: response.showEmail,
          showPhone: response.showPhone,
          showLocation: response.showLocation
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading settings', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.loading = true;
      const settings = this.settingsForm.value;

      this.settingsSetEndpoint.handleAsync(settings).subscribe({
        next: () => {
          this.snackBar.open('Settings updated successfully', 'Close', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/profile', this.userId]);
        },
        error: (error) => {
          this.snackBar.open('Error updating settings', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}
