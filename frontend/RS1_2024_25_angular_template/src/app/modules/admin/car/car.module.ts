import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {CarFormComponent} from './components/car-form/car-form.component';
import {CarListComponent} from './components/car-list/car-list.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    CarListComponent,
    CarFormComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild([
      {path: '', component: CarListComponent},
      {path: 'form', component: CarFormComponent},
      {path: 'form/:id', component: CarFormComponent},
      {path: 'cars', component: CarListComponent},
      {path: 'cars/form', component: CarFormComponent},
      {path: 'cars/form/:id', component: CarFormComponent}
    ]),
    FormsModule
  ]
})
export class CarsModule { }
