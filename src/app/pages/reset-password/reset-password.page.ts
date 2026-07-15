import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ResetPassword } from 'src/app/models/reset-password';
import { ResetPasswordMode } from 'src/app/models/reset-password-mode';
import { MessagesService } from 'src/app/services/common/messages.service';
import { ForgotPasswordService } from 'src/app/services/http/forgot-password.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { PasswordComponent } from '../../components/widgets/password/password.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.page.html',
    styleUrls: ['./reset-password.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, PasswordComponent, MatCardActions, MatButton, RouterLink, MatIcon, TranslatePipe]
})
export class ResetPasswordPage implements OnInit, OnDestroy {
    protected password = signal('');
    protected passwordIsValid = signal(false);
    protected resetPasswordMode = signal(ResetPasswordMode.ResetPassword);

    protected isResetPasswordMode = computed(() => this.resetPasswordMode() === ResetPasswordMode.ResetPassword);
    protected isMissingTokenMode = computed(() => this.resetPasswordMode() === ResetPasswordMode.MissingToken);
    protected isSubmittingMode = computed(() => this.resetPasswordMode() === ResetPasswordMode.Submitting);
    protected isSuccessMode = computed(() => this.resetPasswordMode() === ResetPasswordMode.Success);

    private queryParamsSubscription?: Subscription;
    private forgotPasswordGuid = '';

    private route = inject(ActivatedRoute);
    private forgotPasswordService = inject(ForgotPasswordService);
    private messagesService = inject(MessagesService);
    private translateService = inject(TranslateService);

    ngOnInit(): void {
        this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
            this.forgotPasswordGuid = params.token;

            if (!this.forgotPasswordGuid || this.forgotPasswordGuid.length === 0) {
                this.resetPasswordMode.set(ResetPasswordMode.MissingToken);
            }
        });
    }

    ngOnDestroy(): void {
        this.queryParamsSubscription?.unsubscribe();
    }

    protected async onSubmit(): Promise<void> {
        try {
            this.resetPasswordMode.set(ResetPasswordMode.Submitting);

            const resetPassword = new ResetPassword();
            resetPassword.forgotPasswordGuid = this.forgotPasswordGuid;
            resetPassword.password = this.password();

            await this.forgotPasswordService.confirm(resetPassword);

            this.resetPasswordMode.set(ResetPasswordMode.Success);
        } catch {
            this.resetPasswordMode.set(ResetPasswordMode.ResetPassword);
            this.messagesService.showError(this.translateService.instant('pages.resetPassword.errors.unexpectedResetError'));
        }
    }

    protected onPasswordValid(valid: boolean): void {
        this.passwordIsValid.set(valid);
    }
}
