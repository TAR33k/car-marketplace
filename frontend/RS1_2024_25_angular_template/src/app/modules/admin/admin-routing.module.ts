import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminErrorPageComponent } from './admin-error-page/admin-error-page.component';
import { CitiesComponent } from './cities/cities.component';
import { CitiesEditComponent } from './cities/cities-edit/cities-edit.component';
import { UsersComponent } from './users/users.component';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { CarListComponent } from './car/components/car-list/car-list.component';
import { CarFormComponent } from './car/components/car-form/car-form.component';
import { AdvertisementsComponent } from './advertisements/advertisements.component';
import { AdvertisementsEditComponent } from './advertisements/advertisements-edit/advertisements-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'users/new', component: UsersEditComponent },
      { path: 'users/edit/:id', component: UsersEditComponent },
      { path: 'cities', component: CitiesComponent },
      { path: 'cities/new', component: CitiesEditComponent },
      { path: 'cities/edit/:id', component: CitiesEditComponent },
      { path: 'cars', component: CarListComponent },
      { path: 'cars/new', component: CarFormComponent },
      { path: 'cars/edit/:id', component: CarFormComponent },
      { path: 'advertisements', component: AdvertisementsComponent },
      { path: 'advertisements/new', component: AdvertisementsEditComponent },
      { path: 'advertisements/edit/:id', component: AdvertisementsEditComponent },
      { path: '**', component: AdminErrorPageComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
