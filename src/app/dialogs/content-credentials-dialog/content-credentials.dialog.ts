import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { C2paContentCredentials } from 'src/app/models/c2pa-content-credentials';

@Component({
    selector: 'app-content-credentials-dialog',
    templateUrl: 'content-credentials.dialog.html',
    styleUrls: ['content-credentials.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ContentCredentialsDialog {
    protected contentCredentials: C2paContentCredentials = inject(MAT_DIALOG_DATA);

    private dialogRef = inject(MatDialogRef<ContentCredentialsDialog>);

    protected onClose(): void {
        this.dialogRef.close();
    }
}
