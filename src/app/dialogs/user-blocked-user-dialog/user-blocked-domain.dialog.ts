import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserBlockRequest } from 'src/app/models/user-block-request';

@Component({
    selector: 'app-user-blocked-domain-dialog',
    templateUrl: 'user-blocked-domain.dialog.html',
    styleUrls: ['user-blocked-domain.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UserBlockedUserDialog {
    protected reason = model('');

    private dialogRef = inject(MatDialogRef<UserBlockedUserDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const userMuteRequest = new UserBlockRequest(
            this.reason()
        );

        this.dialogRef.close(userMuteRequest);
    }
}
