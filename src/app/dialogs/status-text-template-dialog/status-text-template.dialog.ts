import { ChangeDetectionStrategy, Component, inject, model, OnInit } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { UserSetting, UserSettingKey } from 'src/app/models/user-setting';
import { MessagesService } from 'src/app/services/common/messages.service';
import { UserSettingsService } from 'src/app/services/http/user-settings.service';
import { FormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MaxLengthValidatorDirective } from '../../validators/directives/max-length-validator.directive';
import { MatButton } from '@angular/material/button';


@Component({
    selector: 'app-status-text-template-dialog',
    templateUrl: 'status-text-template.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatDialogTitle, CdkScrollable, MatDialogContent, MatFormField, MatLabel, InputActivityDirective, MatInput, CdkTextareaAutosize, MaxLengthValidatorDirective, MatError, MatDialogActions, MatButton, TranslatePipe]
})
export class StatusTextDialog implements OnInit {
    protected template = model('');

    private userSettingsService = inject(UserSettingsService);
    private messageService = inject(MessagesService);
    private dialogRef = inject(MatDialogRef<StatusTextDialog>);
    private data?: string = inject(MAT_DIALOG_DATA);
    private translateService = inject(TranslateService);

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

            this.messageService.showSuccess(this.translateService.instant('dialogs.statusTextTemplate.messages.statusTextTemplateHasBeenUpdated'));
            this.dialogRef.close(userSetting);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
