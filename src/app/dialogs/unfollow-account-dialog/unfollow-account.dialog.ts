import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UnfollowRequest } from 'src/app/models/unfollow-request';

@Component({
    selector: 'app-unfollow-account-dialog',
    templateUrl: 'unfollow-account.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UnfollowAccountDialog {
    protected removeStatusesFromTimeline = model(false);
    protected removeReblogsFromTimeline = model(false);

    public dialogRef = inject(MatDialogRef<UnfollowAccountDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const unfollowRequest = new UnfollowRequest(
            this.removeStatusesFromTimeline(),
            this.removeReblogsFromTimeline()
        );

        this.dialogRef.close(unfollowRequest);
    }
}