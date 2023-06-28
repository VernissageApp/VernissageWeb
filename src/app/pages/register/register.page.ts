import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BooleanInput } from '@angular/cdk/coercion';
import { ReCaptchaV3Service } from 'ngx-captcha';

import { User } from 'src/app/models/user';
import { RegisterMode } from 'src/app/models/register-mode';
import { RegisterService } from 'src/app/services/http/register.service';
import { environment } from 'src/environments/environment';
import { WindowService } from 'src/app/services/common/window.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
    readonly RegisterMode = RegisterMode;

    user = new User();
    registerMode = RegisterMode.Register;
    passwordIsValid = false;

    errorMessage?: string;

    constructor(
        private registerService: RegisterService,
        private router: Router,
        private messageService: MessagesService,
        private reCaptchaV3Service: ReCaptchaV3Service,
        private windowService: WindowService,
        @Inject(DOCUMENT) private document: Document
    ) { }

    ngOnInit(): void {
        this.user.redirectBaseUrl = this.windowService.getApplicationUrl();
    }

    async onSubmit(): Promise<void> {
        this.registerMode = RegisterMode.Submitting;

        if (environment.recaptchaKey != "") {
            this.reCaptchaV3Service.execute(environment.recaptchaKey, 'homepage', async (token) => {
                await this.registerUser(token);
            });
        } else {
            await this.registerUser("");
        }
    }

    isRegisterMode(): BooleanInput {
        return this.registerMode === RegisterMode.Register;
    }

    isSubmittingMode(): BooleanInput {
        return this.registerMode === RegisterMode.Submitting;
    }

    isErrorMode(): BooleanInput {
        return this.registerMode === RegisterMode.Error;
    }

    passwordValid(valid: boolean): void {
        this.passwordIsValid = valid;
    }

    private async registerUser(token: string) {
        try {
            this.user.securityToken = token;
            this.user.locale = 'pl_PL';
            this.user.agreement = true;

            await this.registerService.register(this.user);
            this.removeGoogleBadge();

            this.messageService.showSuccess('Your account has been created.');
            await this.router.navigate(['/login']);
        } catch (error: any) {
            if (error.error.code === 'userNameIsAlreadyTaken') {
                this.errorMessage = 'User name is already taken. Please choose different one.';
            } else if (error.error.code === 'emailIsAlreadyConnected') {
                this.errorMessage = 'Given email is already connected with other account.';
            } else {
                this.errorMessage = 'Unexpected error occurred. Please try again.';
            }

            this.registerMode = RegisterMode.Error;
        }
    }

    private removeGoogleBadge(): void {
        const googleBadge = this.document.getElementsByClassName('grecaptcha-badge');
        if (googleBadge && googleBadge.length > 0) {
            googleBadge[0].remove();
        }
    }
}
