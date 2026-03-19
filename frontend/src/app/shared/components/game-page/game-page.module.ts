import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GamePageComponent} from './game-page.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {FullscreenConfirmDialogComponent} from './fullscreen-confirm-dialog/fullscreen-confirm-dialog.component';
import {ExitConfirmDialogComponent} from './exit-confirm-dialog/exit-confirm-dialog.component';

@NgModule({
  declarations: [
    GamePageComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FullscreenConfirmDialogComponent,
    ExitConfirmDialogComponent
  ],
  exports: [
    GamePageComponent
  ]
})
export class GamePageModule {
}

