import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-disable-two-factor-token-dialog',
    templateUrl: 'disable-two-factor-token.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class DisableTwoFactorTokenDialog {
    protected code = model('');

    private accountService = inject(AccountService);
    private messageService = inject(MessagesService);
    private dialogRef = inject(MatDialogRef<DisableTwoFactorTokenDialog>);
    private translateService = inject(TranslateService);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            await this.accountService.disableTwoFactorToken(this.code());
            this.messageService.showSuccess(this.translateService.instant('dialogs.disableTwoFactorToken.messages.twoFactorAuthenticationDisabled'));
            this.dialogRef.close({});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}