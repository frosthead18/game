import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonPageComponent } from './dungeon-page/dungeon-page.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FullscreenConfirmDialogComponent } from './dialogs/fullscreen-confirm-dialog.component';
import { ExitConfirmDialogComponent } from './dialogs/exit-confirm-dialog.component';

@NgModule({
  declarations: [
    DungeonPageComponent,
    FullscreenConfirmDialogComponent,
    ExitConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class DungeonModule { }
