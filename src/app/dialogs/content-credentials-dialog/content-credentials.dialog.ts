import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { C2paContentCredentials } from 'src/app/models/c2pa-content-credentials';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
    selector: 'app-content-credentials-dialog',
    templateUrl: 'content-credentials.dialog.html',
    styleUrls: ['content-credentials.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatIcon, TranslatePipe, LocalizedDatePipe]
})
export class ContentCredentialsDialog {
    protected contentCredentials: C2paContentCredentials = inject(MAT_DIALOG_DATA);

    private dialogRef = inject(MatDialogRef<ContentCredentialsDialog>);

    protected onClose(): void {
        this.dialogRef.close();
    }
}
