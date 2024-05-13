import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'confirmation-dialog',
    templateUrl: 'confirmation.dialog.html',
    styleUrls: ['confirmation.dialog.scss']
})
export class ConfirmationDialog {
    order = 0;
    text = '';

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: string) {
    }

    onNoClick(): void {
        this.dialogRef.close({ confirmed: false});
    }

    async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmed: true});
    }
}