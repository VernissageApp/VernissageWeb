import { ChangeDetectionStrategy, Component, Inject, model } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-content-warning-dialog',
    templateUrl: 'content-warning.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ContentWarningDialog {
    protected contentWarning = model('');

    constructor(
        public dialogRef: MatDialogRef<ContentWarningDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: string) {
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        this.dialogRef.close({ contentWarning: this.contentWarning, statusId: this.data });
    }
}