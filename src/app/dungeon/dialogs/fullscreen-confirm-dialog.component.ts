import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-fullscreen-confirm-dialog',
  templateUrl: './fullscreen-confirm-dialog.component.html',
  standalone: false
})
export class FullscreenConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<FullscreenConfirmDialogComponent>) {}

  onStart(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

