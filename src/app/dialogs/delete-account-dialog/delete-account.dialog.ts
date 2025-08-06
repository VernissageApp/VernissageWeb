import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-delete-account-dialog',
    templateUrl: 'delete-account.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DeleteAccountDialog {
    protected email = model('');

    public dialogRef = inject(MatDialogRef<DeleteAccountDialog>)
    public data: User = inject(MAT_DIALOG_DATA);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmed: true });
    }
}