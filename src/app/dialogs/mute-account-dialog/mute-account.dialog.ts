import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { UserMuteRequest } from 'src/app/models/user-mute-request';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'mute-account',
    templateUrl: 'mute-account.dialog.html'
})
export class MuteAccountDialog {
    muteStatuses = false;
    muteReblogs = false;
    muteNotifications = false;
    muteEnd?: Date;

    constructor(
        public dialogRef: MatDialogRef<MuteAccountDialog>,
        @Inject(MAT_DIALOG_DATA) public data: User
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        const userMuteRequest = new UserMuteRequest(this.muteStatuses, this.muteReblogs, this.muteNotifications, this.muteEnd);
        this.dialogRef.close(userMuteRequest);
    }
}