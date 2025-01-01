import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { RegisterUser } from 'src/app/models/register-user';

import { RegisterMode } from 'src/app/models/register-mode';
import { InstanceService } from 'src/app/services/http/instance.service';
import { RegisterService } from 'src/app/services/http/register.service';
import { environment } from 'src/environments/environment';
import { WindowService } from 'src/app/services/common/window.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { Router } from '@angular/router';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Rule } from 'src/app/models/rule';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class RegisterPage implements OnInit {
    readonly RegisterMode = RegisterMode;

    user = new RegisterUser();
    registerMode = RegisterMode.Register;
    passwordIsValid = false;

    errorMessage?: string;

    constructor(
        private registerService: RegisterService,
        private router: Router,
        private messageService: MessagesService,
        private instanceService: InstanceService,
        private reCaptchaV3Service: ReCaptchaV3Service,
        private windowService: WindowService,
        @Inject(DOCUMENT) private document: Document
    ) { }

    ngOnInit(): void {
        if (!this.instanceService.isRegistrationEnabled()) {
            throw new ForbiddenError();
        }

        this.user.redirectBaseUrl = this.windowService.getApplicationUrl();
        this.user.locale = 'en_US';
        this.user.agreement = false;
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

    isSubmittingMode(): boolean {
        return this.registerMode === RegisterMode.Submitting;
    }

    isErrorMode(): boolean {
        return this.registerMode === RegisterMode.Error;
    }

    passwordValid(valid: boolean): void {
        this.passwordIsValid = valid;
    }

    isRegistrationByApprovalOpened(): boolean {
        return this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByApprovalOpened === true;
    }

    isRegistrationByInvitationsOpened(): boolean {
        return this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByInvitationsOpened === true;
    }

    serverRules(): Rule[] {
        return this.instanceService.instance?.rules ?? [];
    }

    private async registerUser(token: string): Promise<void> {
        try {
            this.user.securityToken = token;

            await this.registerService.register(this.user);
            this.removeGoogleBadge();

            this.messageService.showSuccess('Your account has been created.');
            await this.router.navigate(['/login']);
        } catch (error: any) {
            if (error.error.code === 'userNameIsAlreadyTaken') {
                this.errorMessage = 'User name is already taken. Please choose different one.';
            } else if (error.error.code === 'emailIsAlreadyConnected') {
                this.errorMessage = 'Given email is already connected with other account.';
            } else if (error.error.code === 'invitationTokenIsInvalid') {
                this.errorMessage = 'Invitation token is invalid.';
            } else if (error.error.code === 'invitationTokenHasBeenUsed') {
                this.errorMessage = 'Invitation token has been used.';
            } else if (error.error.code === 'userHaveToAcceptAgreement') {
                this.errorMessage = 'You have to accept server rules.';
            } else if (error.error.code === 'disposableEmailCannotBeUsed') {
                this.errorMessage = 'Disposable email cannot be used.';
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
