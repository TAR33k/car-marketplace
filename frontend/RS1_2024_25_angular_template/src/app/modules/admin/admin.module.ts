import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {AdminLayoutComponent} from './admin-layout/admin-layout.component';
import {AdminErrorPageComponent} from './admin-error-page/admin-error-page.component';
import {CitiesComponent} from './cities/cities.component';
import {CitiesEditComponent} from './cities/cities-edit/cities-edit.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import { UsersComponent } from './users/users.component';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { AdvertisementsComponent } from './advertisements/advertisements.component';
import { AdvertisementsEditComponent } from './advertisements/advertisements-edit/advertisements-edit.component';
import {BodyTypeGetAllEndpointService} from '../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatSortModule} from '@angular/material/sort';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material/dialog';
import { StatusTypeGetAllEndpointService } from '../../endpoints/status-type-endpoints/status-type-get-all-endpoint.service';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatNativeDateModule} from '@angular/material/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { CarEditDialogComponent } from './advertisements/advertisements-edit/car-edit-dialog/car-edit-dialog.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminLayoutComponent,
    AdminErrorPageComponent,
    CitiesComponent,
    CitiesEditComponent,
    UsersComponent,
    UsersEditComponent,
    AdvertisementsComponent,
    AdvertisementsEditComponent,
    CarEditDialogComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatChipsModule,
    OverlayModule,
    ScrollingModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatCheckboxModule,
  ],
  providers: [
    BodyTypeGetAllEndpointService,
    StatusTypeGetAllEndpointService
  ]
})
export class AdminModule {
}
