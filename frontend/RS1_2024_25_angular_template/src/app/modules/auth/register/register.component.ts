import {ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../endpoints/auth-endpoints/auth-register-endpoint.service';
import {debounceTime, switchMap, takeUntil} from 'rxjs';
import {passwordMatchValidator} from '../../../helper/passwordMatchValidator';
import {NotificationService}  from '../../../services/notification.service';
import {TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../../services/language.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  step: number = 1;
  isLoading: boolean = false;
  errorMessage: string = '';
  isUsernameTaken: boolean = false;
  currentLang: string;

  // Password strength properties
  passwordStrength: string = '';
  passwordStrengthMessage: string = '';
  passwordStrengthClass: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.registrationForm = this.initializeForm();
  }

  private initializeForm(): FormGroup {
    return this.fb.group(
      {
        name: ['', Validators.required],
        surname: ['', Validators.required],
        address: ['', Validators.required],
        phoneNumber: ['', [Validators.required, Validators.pattern('^(?:(?:\\+|00)?387|0)?6[0-3][0-9]{6,7}$')]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        emailAddress: ['', [Validators.required, Validators.email, Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@(?:gmail\\.com|outlook\\.com|yahoo\\.com|hotmail\\.com|live\\.com|icloud\\.com|aol\\.com|zoho\\.com|protonmail\\.com|yandex\\.com)$'
        )]]
      },
      {
        validator: passwordMatchValidator('password', 'confirmPassword')
      }
    );
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLang = lang;
        this.cdRef.markForCheck();
      });

    // Username availability check
    this.registrationForm.get('username')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      switchMap(username => this.authService.checkUsernameAvailability(username))
    ).subscribe({
      next: (response) => {
        this.isUsernameTaken = !response.isAvailable;
        this.cdRef.markForCheck();
      },
      error: () => {
        this.isUsernameTaken = false;
        this.errorMessage = '';
        this.cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchLanguage(language: string): void {
    this.languageService.changeLanguage(language);
  }

  passwordsDoNotMatch(): boolean {
    const passwordControl = this.registrationForm.get('password');
    const confirmPasswordControl = this.registrationForm.get('confirmPassword');

    if (this.registrationForm.hasError('passwordsDoNotMatch')) {
      confirmPasswordControl?.setErrors({ passwordsDoNotMatch: true });
      return true;
    } else {
      confirmPasswordControl?.setErrors(null);
      return false;
    }
  }

  onInputChange(controlName: string): void {
    const control = this.registrationForm.get(controlName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  // Step navigation methods
  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.step++;
      this.cdRef.markForCheck();
    }
  }

  previousStep(): void {
    if (this.step > 1) {
      this.step--;
      this.cdRef.markForCheck();
    }
  }

  isCurrentStepValid(): boolean {
    if (this.step === 1) {
      return (this.registrationForm.get('name')?.valid ?? false) &&
        (this.registrationForm.get('surname')?.valid ?? false);
    } else if (this.step === 2) {
      return (this.registrationForm.get('address')?.valid ?? false) &&
        (this.registrationForm.get('phoneNumber')?.valid ?? false);
    } else if (this.step === 3) {
      return (this.registrationForm.get('username')?.valid ?? false) &&
        (this.registrationForm.get('emailAddress')?.valid ?? false) &&
        (this.registrationForm.get('password')?.valid ?? false);
    }
    return false;
  }

  checkPasswordStrength(): void {
    const password = this.registrationForm.get('password')?.value || '';
    const strength = this.getPasswordStrength(password);

    this.passwordStrength = strength;
    if (strength === 'weak') {
      this.passwordStrengthMessage = this.translate.instant('passwordWeak');
      this.passwordStrengthClass = 'text-danger';
    } else if (strength === 'medium') {
      this.passwordStrengthMessage = this.translate.instant('passwordMedium');
      this.passwordStrengthClass = 'text-warning';
    } else if (strength === 'strong') {
      this.passwordStrengthMessage = this.translate.instant('passwordStrong');
      this.passwordStrengthClass = 'text-success';
    } else {
      this.passwordStrengthMessage = '';
      this.passwordStrengthClass = '';
    }

    this.cdRef.markForCheck();
  }

  getPasswordStrength(password: string): string {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    let score = 0;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    if (isLongEnough) score++;

    if (score < 3) return 'weak';
    if (score === 3 || score === 4) return 'medium';
    if (score === 5) return 'strong';

    return '';
  }

  getStrengthBarWidth(): string {
    switch (this.passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid && !this.isUsernameTaken) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(this.registrationForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          const successMessage = this.translate.instant('registrationSuccess');
          this.notificationService.notifyUserAction(successMessage);
          this.registrationForm.reset();
          this.step = 1;
          this.cdRef.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.message || this.translate.instant('generalError');
          this.notificationService.notifyUserAction(errorMessage);
          this.cdRef.markForCheck();
        }
      });
    } else {
      const errorMessage = this.isUsernameTaken
        ? this.translate.instant('usernameTaken')
        : this.translate.instant('pleaseFillFields');
      this.notificationService.notifyUserAction(errorMessage);
    }
  }
}
