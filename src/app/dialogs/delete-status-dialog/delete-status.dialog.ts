import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-delete-status-dialog',
    templateUrl: 'delete-status.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DeleteStatusDialog {
    private dialogRef = inject(MatDialogRef<DeleteStatusDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmation: true });
    }
}
