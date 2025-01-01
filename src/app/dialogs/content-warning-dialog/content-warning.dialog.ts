import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-content-warning-dialog',
    templateUrl: 'content-warning.dialog.html',
    standalone: false
})
export class ContentWarningDialog {
    contentWarning = '';

    constructor(public dialogRef: MatDialogRef<ContentWarningDialog>, @Inject(MAT_DIALOG_DATA) public data?: string) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        this.dialogRef.close({ contentWarning: this.contentWarning, statusId: this.data });
    }
}