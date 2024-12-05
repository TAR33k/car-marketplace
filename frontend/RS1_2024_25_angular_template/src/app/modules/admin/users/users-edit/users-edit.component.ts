import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UserUpdateOrInsertEndpointService } from '../../../../endpoints/user-endpoints/user-update-or-insert-endpoint.service';
import { UserGetByIdEndpointService, UserGetByIdResponse } from '../../../../endpoints/user-endpoints/user-get-by-id-endpoint.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.scss']
})
export class UsersEditComponent implements OnInit {
  @ViewChild('userForm') userForm!: NgForm;

  userId: number;
  user: UserGetByIdResponse = {
    id: 0,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: '',
    isAdmin: false,
    passwordHash: ''
  };
  newPassword: string = '';
  loading = false;
  hidePassword = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private userGetByIdService: UserGetByIdEndpointService,
    private userUpdateService: UserUpdateOrInsertEndpointService,
    private notificationService: NotificationService
  ) {
    this.userId = 0;
  }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.userId && this.userId !== 0) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    this.loading = true;
    this.userGetByIdService.handleAsync(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user data', error);
        this.notificationService.notifyUserAction('Error loading user data');
        this.loading = false;
      }
    });
  }

  updateUser(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.loading = true;
    const updateRequest = {
      id: this.user.id,
      username: this.user.username,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      address: this.user.address,
      phoneNumber: this.user.phoneNumber,
      password: this.newPassword ? this.newPassword : undefined
    };

    this.userUpdateService.handleAsync(updateRequest).subscribe({
      next: () => {
        const message = this.userId === 0 ? 'User added successfully' : 'User updated successfully';
        this.notificationService.notifyUserAction(message);
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        console.error('Error updating user', error);
        this.notificationService.notifyUserAction('Error updating user');
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
