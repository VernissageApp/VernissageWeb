import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChangeEmail } from 'src/app/models/change-email';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'change-email',
    templateUrl: 'change-email.dialog.html'
})
export class ChangeEmailDialog {
    email = '';

    constructor(
        private accountService: AccountService,
        private messagesService: MessagesService,
        private windowService: WindowService,
        public dialogRef: MatDialogRef<ChangeEmailDialog>
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        try {
            const changeEmail = new ChangeEmail();
            changeEmail.email = this.email;
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