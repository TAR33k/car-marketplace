import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CarFormComponent } from './components/car-form/car-form.component';
import { CarListComponent } from './components/car-list/car-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import {MAT_SELECT_CONFIG, MatSelectModule} from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  OverlayModule
} from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    CarListComponent,
    CarFormComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild([
      { path: '', component: CarListComponent },
      { path: 'form', component: CarFormComponent },
      { path: 'form/:id', component: CarFormComponent },
      { path: 'cars', component: CarListComponent },
      { path: 'cars/form', component: CarFormComponent },
      { path: 'cars/form/:id', component: CarFormComponent }
    ]),
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    OverlayModule,
    ScrollingModule
  ],
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: {
        overlayPanelClass: ['select-panel-wrapper'],
        disableOptionCentering: true,
        panelClass: 'mat-select-panel-wrapper'
      }
    }
  ]
})
export class CarsModule { }
