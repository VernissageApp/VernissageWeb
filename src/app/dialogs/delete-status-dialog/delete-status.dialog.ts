import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'delete-status',
    templateUrl: 'delete-status.dialog.html'
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
