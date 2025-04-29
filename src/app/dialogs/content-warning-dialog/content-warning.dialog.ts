import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-content-warning-dialog',
    templateUrl: 'content-warning.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ContentWarningDialog {
    protected contentWarning = model('');

    private dialogRef = inject(MatDialogRef<ContentWarningDialog>);
    private data?: string = inject(MAT_DIALOG_DATA);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        this.dialogRef.close({ contentWarning: this.contentWarning(), statusId: this.data });
    }
}
