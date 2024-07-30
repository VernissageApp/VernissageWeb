import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TwoFactorToken } from 'src/app/models/two-factor-token';
import { User } from 'src/app/models/user';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'enable-two-factor-token',
    templateUrl: 'enable-two-factor-token.dialog.html',
    styleUrls: ['enable-two-factor-token.dialog.scss']
})
export class EnableTwoFactorTokenDialog implements OnInit {
    twoFactorToken?: TwoFactorToken;
    code = '';

    constructor(
        private accountService: AccountService,
        private messageService: MessagesService,
        public dialogRef: MatDialogRef<EnableTwoFactorTokenDialog>,
        @Inject(MAT_DIALOG_DATA) public data?: User) {
    }

    async ngOnInit(): Promise<void> {
        this.twoFactorToken = await this.accountService.getTwoFactorToken();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        try {
            await this.accountService.enableTwoFactorToken(this.code);
            this.messageService.showSuccess('Two factor authentication enabled.');
            this.dialogRef.close({});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}