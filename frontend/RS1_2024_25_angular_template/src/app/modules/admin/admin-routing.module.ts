import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminLayoutComponent} from './admin-layout/admin-layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {AdminErrorPageComponent} from './admin-error-page/admin-error-page.component';
import {CitiesComponent} from './cities/cities.component';
import {CitiesEditComponent} from './cities/cities-edit/cities-edit.component';
import {UsersComponent} from './users/users.component';
import {UsersEditComponent} from './users/users-edit/users-edit.component';
import {CarListComponent} from './car/components/car-list/car-list.component';
import {CarFormComponent} from './car/components/car-form/car-form.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'users', component: UsersComponent },
      {path: 'users/new', component: UsersEditComponent },
      {path: 'users/edit/:id', component: UsersEditComponent },
      {path: 'cities', component: CitiesComponent},
      {path: 'cities/new', component: CitiesEditComponent},
      {path: 'cities/edit/:id', component: CitiesEditComponent},
      {path: 'cars', component: CarListComponent },
      {path: 'cars/add', component: CarFormComponent },
      {path: 'cars/edit/:id', component: CarFormComponent },
      {path: '**', component: AdminErrorPageComponent} // Default ruta
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
