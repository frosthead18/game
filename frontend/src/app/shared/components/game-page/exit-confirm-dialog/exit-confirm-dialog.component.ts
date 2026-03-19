import {Component} from '@angular/core';
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-exit-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Exit Game</h2>
    <mat-dialog-content>
      <p>Are you sure you want to exit the game?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onContinueClick()">Continue</button>
      <button mat-raised-button color="warn" (click)="onExitClick()">Exit</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ExitConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ExitConfirmDialogComponent>) {
  }

  onContinueClick(): void {
    this.dialogRef.close(false);
  }

  onExitClick(): void {
    this.dialogRef.close(true);
  }
}

