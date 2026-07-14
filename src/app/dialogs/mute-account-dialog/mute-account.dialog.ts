import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { UserMuteRequest } from 'src/app/models/user-mute-request';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/list';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-mute-account-dialog',
    templateUrl: 'mute-account.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatCheckbox, MatDivider, MatFormField, MatLabel, InputActivityDirective, MatInput, MatDatepickerInput, MatHint, MatDatepickerToggle, MatSuffix, MatDatepicker, MatDialogActions, MatButton, TranslatePipe]
})
export class MuteAccountDialog {
    protected muteStatuses = model(false);
    protected muteReblogs = model(false);
    protected muteNotifications = model(false);
    protected removeStatusesFromTimeline = model(false);
    protected removeReblogsFromTimeline = model(false);
    protected muteEnd = model<Date>();

    public dialogRef = inject(MatDialogRef<MuteAccountDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const userMuteRequest = new UserMuteRequest(
            this.muteStatuses(),
            this.muteReblogs(),
            this.muteNotifications(),
            this.muteStatuses() && this.removeStatusesFromTimeline(),
            this.muteReblogs() && this.removeReblogsFromTimeline(),
            this.muteEnd(),
        );

        this.dialogRef.close(userMuteRequest);
    }
}