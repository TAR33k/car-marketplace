import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export function passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const passwordControl = formGroup.get(password);
    const confirmPasswordControl = formGroup.get(confirmPassword);

    if (!passwordControl || !confirmPasswordControl) {
      return null; // Skip validation if controls are missing
    }

    const passwordValue = passwordControl.value;
    const confirmPasswordValue = confirmPasswordControl.value;

    if (passwordValue !== confirmPasswordValue) {
      confirmPasswordControl.setErrors({ passwordsDoNotMatch: true }); // Set error dynamically
      return { passwordsDoNotMatch: true }; // Return error at group level for consistency
    } else {
      // Clear the error dynamically if the passwords match
      if (confirmPasswordControl.hasError('passwordsDoNotMatch')) {
        confirmPasswordControl.setErrors(null);
      }
    }

    return null; // No errors at the form group level
  };
}
