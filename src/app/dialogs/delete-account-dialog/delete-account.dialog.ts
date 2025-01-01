import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'app-delete-account-dialog',
    templateUrl: 'delete-account.dialog.html',
    standalone: false
})
export class DeleteAccountDialog {
    email = '';

    constructor(
        private accountService: AccountService,
        private messagesService: MessagesService,
        private windowService: WindowService,
        public dialogRef: MatDialogRef<DeleteAccountDialog>,
        @Inject(MAT_DIALOG_DATA) public data: User
    ) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        this.dialogRef.close({ confirmed: true});
    }
}