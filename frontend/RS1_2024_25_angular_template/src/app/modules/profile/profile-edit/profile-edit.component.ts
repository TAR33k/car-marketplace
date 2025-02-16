import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserGetByIdEndpointService } from '../../../endpoints/user-endpoints/user-get-by-id-endpoint.service';
import { UserUpdateOrInsertEndpointService } from '../../../endpoints/user-endpoints/user-update-or-insert-endpoint.service';
import { NotificationService } from '../../../services/notification.service';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  userId: number;
  isOwnProfile = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserGetByIdEndpointService,
    private userUpdateService: UserUpdateOrInsertEndpointService,
    private notificationService: NotificationService,
    private authService: MyAuthService,
    private dialog: MatDialog
  ) {
    this.userId = 0;
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.isOwnProfile = this.userId === this.authService.getMyAuthInfo()?.userId;

      if (!this.isOwnProfile) {
        this.router.navigate(['/unauthorized']);
        return;
      }

      this.loadUserProfile();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      userName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]*$')]],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]*$')]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^(?:(?:\\+|00)?387|0)?6[0-3][0-9]{6,7}$')]],
      address: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  private loadUserProfile() {
    this.loading = true;
    this.userService.handleAsync(this.userId).subscribe({
      next: (userData) => {
        this.profileForm.patchValue({
          userName: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          address: userData.address
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.notificationService.notifyUserAction('Error loading profile');
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.profileForm.value;

    const updateRequest = {
      id: this.userId,
      username: formValue.userName,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      address: formValue.address
    };

    this.userUpdateService.handleAsync(updateRequest).subscribe({
      next: () => {
        this.notificationService.notifyUserAction('Profile updated successfully');
        this.router.navigate(['/profile', this.userId]);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.notificationService.notifyUserAction('Error updating profile');
        this.loading = false;
      }
    });
  }

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.notifyUserAction('Password changed successfully');
      }
    });
  }

  cancel() {
    this.router.navigate(['/profile', this.userId]);
  }
}
