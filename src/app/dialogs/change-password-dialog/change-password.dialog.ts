import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChangePassword } from 'src/app/models/change-password';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'app-change-password-dialog',
    templateUrl: 'change-password.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ChangePasswordDialog {
    protected oldPassword = model('');
    protected password = model('');
    protected passwordIsValid = signal(true);

    constructor(
        private accountService: AccountService,
        private messagesService: MessagesService,
        public dialogRef: MatDialogRef<ChangePasswordDialog>
    ) { }

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

            this.messagesService.showSuccess('Password has been changed.');
            this.dialogRef.close();
        } catch (error) {
            console.error(error);
            this.messagesService.showServerError(error);
        }
    }
}