import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ChangeEmail } from 'src/app/models/change-email';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { AccountService } from 'src/app/services/http/account.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { UniqueEmailValidatorDirective } from '../../validators/directives/unique-email-validator.directive';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-change-email-dialog',
    templateUrl: 'change-email.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, UniqueEmailValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class ChangeEmailDialog {
    protected email = model('');

    private accountService = inject(AccountService);
    private messagesService = inject(MessagesService);
    private windowService = inject(WindowService);
    private dialogRef = inject(MatDialogRef<ChangeEmailDialog>);
    private translateService = inject(TranslateService);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            const changeEmail = new ChangeEmail();
            changeEmail.email = this.email();
            changeEmail.redirectBaseUrl = this.windowService.getApplicationUrl();

            await this.accountService.changeEmail(changeEmail);

            this.messagesService.showSuccess(this.translateService.instant('dialogs.changeEmail.messages.emailHasBeenChanged'));
            this.dialogRef.close();
        } catch (error) {
            console.error(error);
            this.messagesService.showServerError(error);
        }
    }
}