import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-delete-status-dialog',
    templateUrl: 'delete-status.dialog.html',
    standalone: false
})
export class DeleteStatusDialog {
    constructor(public dialogRef: MatDialogRef<DeleteStatusDialog>) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmation: true });
    }
}
