import { Component, OnInit } from '@angular/core';

import { ForgotPassword } from 'src/app/models/forgot-password';
import { ForgotPasswordMode } from 'src/app/models/forgot-password-mode';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { ForgotPasswordService } from 'src/app/services/http/forgot-password.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class ForgotPasswordPage implements OnInit {

    forgotPassword = new ForgotPassword();
    forgotPasswordMode = ForgotPasswordMode.ForgotPassword;

    constructor(
        private forgotPasswordService: ForgotPasswordService,
        private messagesService: MessagesService,
        private windowService: WindowService) {
    }

    ngOnInit(): void {
        this.forgotPassword.redirectBaseUrl = this.windowService.getApplicationUrl();
    }

    async onSubmit(): Promise<void> {
        try {
            this.forgotPasswordMode = ForgotPasswordMode.Submitting;
            await this.forgotPasswordService.token(this.forgotPassword);
            this.forgotPasswordMode = ForgotPasswordMode.Success;
        } catch (error: any) {
            if (error.error.code === 'userNotFound') {
                this.forgotPasswordMode = ForgotPasswordMode.UserNotExists;
                return;
            }

            this.forgotPasswordMode = ForgotPasswordMode.ForgotPassword;
            this.messagesService.showError('Unexpected error during resetting your password. Please try again.');
        }
    }

    isForgotPasswordMode(): boolean {
        return this.forgotPasswordMode === ForgotPasswordMode.ForgotPassword;
    }

    isSubmittingMode(): boolean {
        return this.forgotPasswordMode === ForgotPasswordMode.Submitting;
    }

    isUserNotExistsMode(): boolean {
        return this.forgotPasswordMode === ForgotPasswordMode.UserNotExists;
    }

    isSuccessMode(): boolean {
        return this.forgotPasswordMode === ForgotPasswordMode.Success;
    }

    resetMode(): void {
        this.forgotPasswordMode = ForgotPasswordMode.ForgotPassword;
    }
}
