import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private userActionSubject = new Subject<string>();
  userAction$ = this.userActionSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {
    // Subscribe to user actions and show appropriate snackbar
    this.userAction$.subscribe(message => {
      this.showSnackBar(message);
    });
  }

  notifyUserAction(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-notification']
    });
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}
