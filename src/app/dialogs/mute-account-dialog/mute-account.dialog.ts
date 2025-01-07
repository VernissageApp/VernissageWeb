import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserMuteRequest } from 'src/app/models/user-mute-request';

@Component({
    selector: 'app-mute-account-dialog',
    templateUrl: 'mute-account.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MuteAccountDialog {
    protected muteStatuses = model(false);
    protected muteReblogs = model(false);
    protected muteNotifications = model(false);
    protected muteEnd = model<Date>();

    constructor(public dialogRef: MatDialogRef<MuteAccountDialog>) {
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const userMuteRequest = new UserMuteRequest(this.muteStatuses(), this.muteReblogs(), this.muteNotifications(), this.muteEnd());
        this.dialogRef.close(userMuteRequest);
    }
}