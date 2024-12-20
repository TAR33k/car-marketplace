import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthRoutingModule} from './auth-routing.module';
import {LoginComponent} from './login/login.component';
import {RegistrationComponent} from './register/register.component';
import {ForgetPasswordComponent} from './forget-password/forget-password.component';
import {TwoFactorComponent} from './two-factor/two-factor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LogoutComponent } from './logout/logout.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import {TranslatePipe} from "@ngx-translate/core";


@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    ForgetPasswordComponent,
    TwoFactorComponent,
    LogoutComponent,
    AuthLayoutComponent
  ],
    imports: [
        CommonModule,
        AuthRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslatePipe
    ]
})
export class AuthModule {
}
