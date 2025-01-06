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

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmation: true });
    }
}
