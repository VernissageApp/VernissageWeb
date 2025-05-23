import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChangeEmail } from 'src/app/models/change-email';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'app-change-email-dialog',
    templateUrl: 'change-email.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ChangeEmailDialog {
    protected email = model('');

    private accountService = inject(AccountService);
    private messagesService = inject(MessagesService);
    private windowService = inject(WindowService);
    private dialogRef = inject(MatDialogRef<ChangeEmailDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            const changeEmail = new ChangeEmail();
            changeEmail.email = this.email();
            changeEmail.redirectBaseUrl = this.windowService.getApplicationUrl();

            await this.accountService.changeEmail(changeEmail);

            this.messagesService.showSuccess('Email has been changed.');
            this.dialogRef.close();
        } catch (error) {
            console.error(error);
            this.messagesService.showServerError(error);
        }
    }
}