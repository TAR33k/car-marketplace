import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserChangePasswordEndpointService } from '../../../endpoints/user-endpoints/user-change-password-endpoint.service';
import { NotificationService } from '../../../services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent {
  passwordForm: FormGroup;
  loading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  readonly passwordPattern = {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    requirements: [
      { text: 'At least 8 characters', regex: /.{8,}/ },
      { text: 'At least one uppercase letter', regex: /[A-Z]/ },
      { text: 'At least one lowercase letter', regex: /[a-z]/ },
      { text: 'At least one number', regex: /\d/ },
      { text: 'At least one special character', regex: /[@$!%*?&]/ }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private passwordService: UserChangePasswordEndpointService,
    private notificationService: NotificationService
  ) {
    this.passwordForm = this.createForm();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(this.passwordPattern.pattern)
      ]],
      confirmPassword: ['', [Validators.required]]
    });

    form.get('confirmPassword')?.valueChanges.subscribe(() => {
      const newPassword = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;

      if (newPassword !== confirmPassword) {
        form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      }
    });

    form.get('newPassword')?.valueChanges.subscribe(() => {
      const newPassword = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;

      if (confirmPassword) {
        if (newPassword !== confirmPassword) {
          form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        } else {
          const confirmControl = form.get('confirmPassword');
          const errors = confirmControl?.errors;
          if (errors) {
            delete errors['passwordMismatch'];
            confirmControl?.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    });

    return form;
  }

  getPasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;
    this.passwordPattern.requirements.forEach(req => {
      if (req.regex.test(password)) strength += 20;
    });
    return strength;
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.passwordService.handleAsync({
      currentPassword,
      newPassword
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.notificationService.notifyUserAction('Password changed successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        if (error.status === 400) {
          this.passwordForm.get('currentPassword')?.setErrors({ incorrect: true });
          this.notificationService.notifyUserAction('Current password is incorrect');
        } else {
          this.notificationService.notifyUserAction('Error changing password');
        }
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.passwordForm.get(controlName);
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return `${controlName === 'currentPassword' ? 'Current password' : 'Password'} is required`;
    }
    if (control.errors['pattern']) {
      return 'Password must meet all requirements';
    }
    if (control.errors['incorrect']) {
      return 'Current password is incorrect';
    }
    if (control.errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }
}
