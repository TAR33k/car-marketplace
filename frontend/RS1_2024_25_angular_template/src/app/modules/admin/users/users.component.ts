import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { UserGetAllEndpointService, UserGetAllResponse } from '../../../endpoints/user-endpoints/user-get-all-endpoint.service';
import { UserDeleteEndpointService } from '../../../endpoints/user-endpoints/user-delete-endpoint.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'firstName', 'lastName', 'email', 'actions'];
  dataSource = new MatTableDataSource<UserGetAllResponse>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userGetService: UserGetAllEndpointService,
    private userDeleteService: UserDeleteEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  fetchUsers(): void {
    this.userGetService.handleAsync().subscribe({
      next: (data) => this.dataSource.data = data,
      error: (err) => {
        console.error('Error fetching users:', err);
        this.notificationService.notifyUserAction('Error fetching users');
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editUser(id: number): void {
    this.router.navigate(['/admin/users/edit', id]);
  }

  addUser(): void {
    this.router.navigate(['/admin/users/edit', 0]);
  }

  deleteUser(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userDeleteService.handleAsync(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(user => user.id !== id);
            this.notificationService.notifyUserAction('User deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting user:', err);
            this.notificationService.notifyUserAction('Error deleting user');
          }
        });
      }
    });
  }
}
