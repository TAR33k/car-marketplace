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
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

// Chat Components
import { ChatComponent } from './chat/components/chat.component';
import { ChatService } from './chat/services/chat.service';
import {TimeAgoPipe} from './chat/services/time-ago.pipe';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatRippleModule} from '@angular/material/core';
import {MatBadgeModule} from '@angular/material/badge';

@NgModule({
    declarations: [
        UnauthorizedComponent,
        HeaderComponent,
        FooterComponent,
        ConfirmDialogComponent,
        ChatComponent,
        TimeAgoPipe
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
    MatDialogTitle,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatRippleModule,
    MatBadgeModule
  ],
  exports: [
    UnauthorizedComponent,
    HeaderComponent,
    FooterComponent,
    ChatComponent,
    TimeAgoPipe
  ],
    providers: [
        ChatService
    ]
})
export class SharedModule { }
