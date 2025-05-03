import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserSetting, UserSettingKey } from 'src/app/models/user-setting';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UserSettingsService } from 'src/app/services/http/user-settings.service';


@Component({
    selector: 'app-status-text-template-dialog',
    templateUrl: 'status-text-template.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatusTextDialog implements OnInit {
    protected template = model('');

    private userSettingsService = inject(UserSettingsService);
    private messageService = inject(MessagesService);
    private dialogRef = inject(MatDialogRef<StatusTextDialog>);
    private data?: string = inject(MAT_DIALOG_DATA);

    ngOnInit(): void {
        this.template.set(this.data ?? '');
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        const userSetting = new UserSetting();
        userSetting.key = UserSettingKey.statusTextTemplate;
        userSetting.value = this.template();

        try {
            await this.userSettingsService.set(userSetting);

            this.messageService.showSuccess('Status text template has been updated.');
            this.dialogRef.close(userSetting);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
