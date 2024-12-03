import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {AdminLayoutComponent} from './admin-layout/admin-layout.component';
import {AdminErrorPageComponent} from './admin-error-page/admin-error-page.component';
import {CitiesComponent} from './cities/cities.component';
import {CitiesEditComponent} from './cities/cities-edit/cities-edit.component';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import { UsersComponent } from './users/users.component';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { AdvertisementsComponent } from './advertisements/advertisements.component';
import { AdvertisementsEditComponent } from './advertisements/advertisements-edit/advertisements-edit.component';
import {BodyTypeGetAllEndpointService} from '../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';


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
    AdvertisementsEditComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule // Omogućava pristup svemu što je eksportovano iz SharedModule
  ],
  providers: [
    BodyTypeGetAllEndpointService
  ]
})
export class AdminModule {
}
