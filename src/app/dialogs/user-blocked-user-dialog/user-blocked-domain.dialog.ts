import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { UserBlockRequest } from 'src/app/models/user-block-request';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-user-blocked-domain-dialog',
    templateUrl: 'user-blocked-domain.dialog.html',
    styleUrls: ['user-blocked-domain.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class UserBlockedUserDialog {
    protected reason = model('');

    private dialogRef = inject(MatDialogRef<UserBlockedUserDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const userMuteRequest = new UserBlockRequest(
            this.reason()
        );

        this.dialogRef.close(userMuteRequest);
    }
}
