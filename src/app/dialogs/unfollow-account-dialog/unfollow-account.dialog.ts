import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { UnfollowRequest } from 'src/app/models/unfollow-request';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-unfollow-account-dialog',
    templateUrl: 'unfollow-account.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatCheckbox, MatDialogActions, MatButton, TranslatePipe]
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