import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { SharedModule } from '../shared/shared.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatSliderModule} from '@angular/material/slider';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from "@angular/material/menu";
import {TranslateModule, TranslatePipe} from '@ngx-translate/core';
import { AdvertisementListComponent } from './advertisements/advertisement-list/advertisement-list.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'advertisements',
    component: AdvertisementListComponent
  }
];

@NgModule({
  declarations: [
    LandingPageComponent,
    AdvertisementListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    OverlayModule,
    MatSliderModule,
    FormsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    TranslateModule.forChild(),
    MatPaginatorModule,
    MatSortModule,
    MatTableModule
  ]
})
export class PublicModule { }
