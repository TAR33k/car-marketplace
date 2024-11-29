import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UserUpdateOrInsertEndpointService
} from '../../../../endpoints/user-endpoints/user-update-or-insert-endpoint.service';
import {
  UserGetByIdEndpointService,
  UserGetByIdResponse
} from '../../../../endpoints/user-endpoints/user-get-by-id-endpoint.service';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.css']
})
export class UsersEditComponent implements OnInit {
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
    passwordHash: '' // Editable only if changing the password
  };
  newPassword: string = ''; // Variable to store the new password input

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private userGetByIdService: UserGetByIdEndpointService,
    private userUpdateService: UserUpdateOrInsertEndpointService
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
    this.userGetByIdService.handleAsync(this.userId).subscribe({
      next: (user) => this.user = user,
      error: (error) => console.error('Error loading user data', error)
    });
  }

  updateUser(): void {
    // Prepare the data to send to the backend
    const updateRequest = {
      id: this.user.id,
      username: this.user.username,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      address: this.user.address,
      phoneNumber: this.user.phoneNumber,
      password: this.newPassword ? this.newPassword : undefined // Send undefined if password is not updated
    };

    this.userUpdateService.handleAsync(updateRequest).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: (error) => console.error('Error updating user', error)
    });
  }
}
