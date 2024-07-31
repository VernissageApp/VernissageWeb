import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserMuteRequest } from 'src/app/models/user-mute-request';

@Component({
    selector: 'app-mute-account-dialog',
    templateUrl: 'mute-account.dialog.html'
})
export class MuteAccountDialog {
    muteStatuses = false;
    muteReblogs = false;
    muteNotifications = false;
    muteEnd?: Date;

    constructor(public dialogRef: MatDialogRef<MuteAccountDialog>) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    async onSubmit(): Promise<void> {
        const userMuteRequest = new UserMuteRequest(this.muteStatuses, this.muteReblogs, this.muteNotifications, this.muteEnd);
        this.dialogRef.close(userMuteRequest);
    }
}