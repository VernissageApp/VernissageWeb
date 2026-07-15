import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FollowingImport } from 'src/app/models/following-import';
import { FollowingImportItemStatus } from 'src/app/models/following-import-item-status';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
    selector: 'app-following-import-accounts-dialog',
    templateUrl: 'following-import-accounts.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatChipSet, MatChip, MatTooltip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatDialogActions, MatButton, TranslatePipe, LocalizedDatePipe]
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
