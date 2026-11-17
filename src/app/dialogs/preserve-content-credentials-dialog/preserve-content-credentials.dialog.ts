import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

import { PreserveContentCredentialsDialogData } from 'src/app/models/preserve-content-credentials-dialog-data';

@Component({
    selector: 'app-preserve-content-credentials-dialog',
    templateUrl: './preserve-content-credentials.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, TranslatePipe]
})
export class PreserveContentCredentialsDialog {
    protected readonly data = inject<PreserveContentCredentialsDialogData>(MAT_DIALOG_DATA);
}
