import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserGetAllEndpointService, UserGetAllResponse } from '../../../endpoints/user-endpoints/user-get-all-endpoint.service';
import { UserDeleteEndpointService } from '../../../endpoints/user-endpoints/user-delete-endpoint.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  users: UserGetAllResponse[] = [];

  constructor(
    private userGetService: UserGetAllEndpointService,
    private userDeleteService: UserDeleteEndpointService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userGetService.handleAsync().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  editUser(id: number): void {
    this.router.navigate(['/admin/users/edit', id]);
  }

  addUser(): void {
    this.router.navigate(['/admin/users/edit', 0]);
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userDeleteService.handleAsync(id).subscribe({
        next: () => {
          console.log(`User with ID ${id} deleted successfully`);
          this.users = this.users.filter(user => user.id !== id); // Remove from local list
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }
}
