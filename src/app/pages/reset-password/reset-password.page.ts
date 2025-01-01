import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ResetPassword } from 'src/app/models/reset-password';
import { ResetPasswordMode } from 'src/app/models/reset-password-mode';
import { MessagesService } from 'src/app/services/common/messages.service';
import { ForgotPasswordService } from 'src/app/services/http/forgot-password.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.page.html',
    styleUrls: ['./reset-password.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class ResetPasswordPage implements OnInit, OnDestroy {

    resetPassword = new ResetPassword();
    resetPasswordMode = ResetPasswordMode.ResetPassword;
    queryParamsSubscription?: Subscription;
    passwordIsValid = false;

    constructor(
        private route: ActivatedRoute,
        private forgotPasswordService: ForgotPasswordService,
        private messagesService: MessagesService
    ) { }

    ngOnInit(): void {
        this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
            this.resetPassword.forgotPasswordGuid = params.token;

            if (!this.resetPassword.forgotPasswordGuid || this.resetPassword.forgotPasswordGuid.length === 0) {
                this.resetPasswordMode = ResetPasswordMode.MissingToken;
            }
        });
    }

    ngOnDestroy(): void {
        this.queryParamsSubscription?.unsubscribe();
    }

    async onSubmit(): Promise<void> {
        try {
            this.resetPasswordMode = ResetPasswordMode.Submitting;
            await this.forgotPasswordService.confirm(this.resetPassword);
            this.resetPasswordMode = ResetPasswordMode.Success;
        } catch {
            this.resetPasswordMode = ResetPasswordMode.ResetPassword;
            this.messagesService.showError('Unexpected error during resetting your password. Please try again.');
        }
    }

    isResetPasswordMode(): boolean {
        return this.resetPasswordMode === ResetPasswordMode.ResetPassword;
    }

    isMissingTokenMode(): boolean {
        return this.resetPasswordMode === ResetPasswordMode.MissingToken;
    }

    isSubmittingMode(): boolean {
        return this.resetPasswordMode === ResetPasswordMode.Submitting;
    }

    isSuccessMode(): boolean {
        return this.resetPasswordMode === ResetPasswordMode.Success;
    }

    passwordValid(valid: boolean): void {
        this.passwordIsValid = valid;
    }
}
