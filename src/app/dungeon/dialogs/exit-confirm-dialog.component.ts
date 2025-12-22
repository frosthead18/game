import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-exit-confirm-dialog',
  templateUrl: './exit-confirm-dialog.component.html',
  standalone: false
})
export class ExitConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ExitConfirmDialogComponent>) {}

  onExit(): void {
    this.dialogRef.close(true);
  }

  onContinue(): void {
    this.dialogRef.close(false);
  }
}

