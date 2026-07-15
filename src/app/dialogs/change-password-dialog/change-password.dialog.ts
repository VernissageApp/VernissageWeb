import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ChangePassword } from 'src/app/models/change-password';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { PasswordComponent } from '../../components/widgets/password/password.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-change-password-dialog',
    templateUrl: 'change-password.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MaxLengthValidatorDirective, MatError, PasswordComponent, MatDialogActions, MatButton, TranslatePipe]
})
export class ChangePasswordDialog {
    protected oldPassword = model('');
    protected password = model('');
    protected passwordIsValid = signal(true);

    private accountService = inject(AccountService);
    private messagesService = inject(MessagesService);
    public dialogRef = inject(MatDialogRef<ChangePasswordDialog>);
    private translateService = inject(TranslateService);

    protected onPasswordValid(valid: boolean): void {
        this.passwordIsValid.set(valid);
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            const changePassword = new ChangePassword();
            changePassword.currentPassword = this.oldPassword();
            changePassword.newPassword = this.password();

            await this.accountService.changePassword(changePassword);

            this.messagesService.showSuccess(this.translateService.instant('dialogs.changePassword.messages.passwordHasBeenChanged'));
            this.dialogRef.close();
        } catch (error) {
            console.error(error);
            this.messagesService.showServerError(error);
        }
    }
}
