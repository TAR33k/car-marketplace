import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { UserAdvertisementsComponent } from './user-advertisements/user-advertisements.component';
import { SavedAdvertisementsComponent } from './saved-advertisements/saved-advertisements.component';

// Material Imports
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { AdvertisementGridComponent } from './advertisement-grid/advertisement-grid.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import { ProfileActivityComponent } from './profile-activity/profile-activity.component';
import { ProfileStatisticsComponent } from './profile-statistics/profile-statistics.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ChangePasswordDialogComponent} from './change-password-dialog/change-password-dialog.component';
import { SettingsComponent } from './settings/settings.component';
import {AuthGuard} from '../../auth-guards/auth-guard.service';

const routes: Routes = [
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },
  {
    path: ':id',
    component: ProfileComponent
  },
  {
    path: ':id/edit',
    component: ProfileEditComponent,
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },
  { path: '', redirectTo: '/public', pathMatch: 'full' },
  { path: '**', redirectTo: '/public', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileEditComponent,
    UserAdvertisementsComponent,
    SavedAdvertisementsComponent,
    AdvertisementGridComponent,
    ProfileActivityComponent,
    ProfileStatisticsComponent,
    ChangePasswordDialogComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatListModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ]
})
export class ProfileModule { }
