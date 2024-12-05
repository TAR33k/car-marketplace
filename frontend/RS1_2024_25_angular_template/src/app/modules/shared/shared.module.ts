import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import {UnauthorizedComponent} from './unauthorized/unauthorized.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import {MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';

@NgModule({
  declarations: [
    UnauthorizedComponent,
    HeaderComponent,
    FooterComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle
  ],
  exports: [
    UnauthorizedComponent,
    HeaderComponent,
    FooterComponent
  ]
})
export class SharedModule { }
