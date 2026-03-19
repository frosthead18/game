import {Component} from '@angular/core';
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-fullscreen-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Enter Fullscreen Mode</h2>
    <mat-dialog-content>
      <p>The game will enter fullscreen mode for the best experience.</p>
      <p>Press ESC at any time to exit the game.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancelClick()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onStartClick()">Start</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class FullscreenConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<FullscreenConfirmDialogComponent>) {
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }

  onStartClick(): void {
    this.dialogRef.close(true);
  }
}

