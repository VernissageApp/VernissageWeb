import { Component, Inject, model } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-delete-account-dialog',
    templateUrl: 'delete-account.dialog.html',
    standalone: false
})
export class DeleteAccountDialog {
    protected email = model('');

    constructor(
        public dialogRef: MatDialogRef<DeleteAccountDialog>,
        @Inject(MAT_DIALOG_DATA) public data: User
    ) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmed: true});
    }
}