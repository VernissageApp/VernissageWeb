import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';

import { ForgotPassword } from 'src/app/models/forgot-password';
import { ForgotPasswordMode } from 'src/app/models/forgot-password-mode';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { ForgotPasswordService } from 'src/app/services/http/forgot-password.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ForgotPasswordPage {
    protected email = model('');
    protected forgotPasswordMode = signal(ForgotPasswordMode.ForgotPassword);

    protected isForgotPasswordMode = computed(() => this.forgotPasswordMode() === ForgotPasswordMode.ForgotPassword);
    protected isSubmittingMode = computed(() => this.forgotPasswordMode() === ForgotPasswordMode.Submitting);
    protected isUserNotExistsMode = computed(() => this.forgotPasswordMode() === ForgotPasswordMode.UserNotExists);
    protected isSuccessMode = computed(() => this.forgotPasswordMode() === ForgotPasswordMode.Success);

    private forgotPasswordService = inject(ForgotPasswordService);
    private messagesService = inject(MessagesService);
    private windowService = inject(WindowService);

    async onSubmit(): Promise<void> {
        try {
            this.forgotPasswordMode.set(ForgotPasswordMode.Submitting);

            const forgotPassword = new ForgotPassword()
            forgotPassword.redirectBaseUrl = this.windowService.getApplicationUrl();
            forgotPassword.email = this.email();

            await this.forgotPasswordService.token(forgotPassword);
            this.forgotPasswordMode.set(ForgotPasswordMode.Success);
        } catch (error: any) {
            if (error.error.code === 'userNotFound') {
                this.forgotPasswordMode.set(ForgotPasswordMode.UserNotExists);
                return;
            }

            this.forgotPasswordMode.set(ForgotPasswordMode.ForgotPassword);
            this.messagesService.showError('Unexpected error during resetting your password. Please try again.');
        }
    }

    resetMode(): void {
        this.forgotPasswordMode.set(ForgotPasswordMode.ForgotPassword);
    }
}
