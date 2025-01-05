import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: 'confirmation.dialog.html',
    styleUrls: ['confirmation.dialog.scss'],
    standalone: false
})
export class ConfirmationDialog implements OnInit {
    protected text = signal('');

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: string) {
    }

    ngOnInit(): void {
        this.text.set(this.data ?? '');
    }

    onNoClick(): void {
        this.dialogRef.close({ confirmed: false});
    }

    async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmed: true});
    }
}