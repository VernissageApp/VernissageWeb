import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'app-disable-two-factor-token-dialog',
    templateUrl: 'disable-two-factor-token.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DisableTwoFactorTokenDialog {
    protected code = model('');

    private accountService = inject(AccountService);
    private messageService = inject(MessagesService);
    private dialogRef = inject(MatDialogRef<DisableTwoFactorTokenDialog>);

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            await this.accountService.disableTwoFactorToken(this.code());
            this.messageService.showSuccess('Two factor authentication disabled.');
            this.dialogRef.close({});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}