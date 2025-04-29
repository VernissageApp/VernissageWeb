import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TwoFactorToken } from 'src/app/models/two-factor-token';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AccountService } from 'src/app/services/http/account.service';

@Component({
    selector: 'app-enable-two-factor-token-dialog',
    templateUrl: 'enable-two-factor-token.dialog.html',
    styleUrls: ['enable-two-factor-token.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EnableTwoFactorTokenDialog implements OnInit {
    protected twoFactorToken = signal<TwoFactorToken | undefined>(undefined);
    protected code = model('');

    private accountService = inject(AccountService);
    private messageService = inject(MessagesService);
    private dialogRef = inject(MatDialogRef<EnableTwoFactorTokenDialog>);

    async ngOnInit(): Promise<void> {
        const downloadedToken = await this.accountService.getTwoFactorToken();
        this.twoFactorToken.set(downloadedToken);
    }

    protected onNoClick(): void {
        this.dialogRef.close();
    }

    protected async onSubmit(): Promise<void> {
        try {
            await this.accountService.enableTwoFactorToken(this.code());
            this.messageService.showSuccess('Two factor authentication enabled.');
            this.dialogRef.close({});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}