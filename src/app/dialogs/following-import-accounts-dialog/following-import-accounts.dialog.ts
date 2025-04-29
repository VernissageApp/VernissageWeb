import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FollowingImport } from 'src/app/models/following-import';
import { FollowingImportItemStatus } from 'src/app/models/following-import-item-status';

@Component({
    selector: 'app-following-import-accounts-dialog',
    templateUrl: 'following-import-accounts.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FollowingImportAccountsDialog {
    protected readonly followingImportItemStatus = FollowingImportItemStatus;
    protected readonly followingImportsDisplayedColumns: string[] = ['account', 'startedAt', 'endedAt', 'status'];

    protected data?: FollowingImport = inject(MAT_DIALOG_DATA);
    private dialogRef = inject(MatDialogRef<FollowingImportAccountsDialog>)
    
    protected onNoClick(): void {
        this.dialogRef.close();
    }
}
