import { Component, OnInit, signal, model, computed, ChangeDetectionStrategy, inject } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RegisterPage implements OnInit {
    protected readonly registerMode = RegisterMode;
    protected userName = model('');
    protected email = model('');
    protected fullName = model('');
    protected locale = model('en_US');
    protected password = model('');
    protected agreement = model(false);
    protected inviteToken = model('');
    protected reason = model('');

    protected registerPageMode = signal(RegisterMode.Register);
    protected passwordIsValid = signal(false);
    protected errorMessage = signal<string | undefined>(undefined);
    protected isRegistrationByApprovalOpened = signal(false);
    protected isRegistrationByInvitationsOpened = signal(false);
    protected serverRules = signal<Rule[]>([]);

    protected isSubmittingMode = computed(() => this.registerPageMode() === RegisterMode.Submitting);
    protected isErrorMode = computed(() => this.registerPageMode() === RegisterMode.Error);

    private registerService = inject(RegisterService);
    private router = inject(Router);
    private messageService = inject(MessagesService);
    private instanceService = inject(InstanceService);
    private reCaptchaV3Service = inject(ReCaptchaV3Service);
    private windowService = inject(WindowService);
    private document = inject(DOCUMENT);

    ngOnInit(): void {
        if (!this.instanceService.isRegistrationEnabled()) {
            throw new ForbiddenError();
        }

        this.isRegistrationByApprovalOpened.set(this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByApprovalOpened === true);
        this.isRegistrationByInvitationsOpened.set(this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByInvitationsOpened === true);
        this.serverRules.set(this.instanceService.instance?.rules ?? []);
    }

    async onSubmit(): Promise<void> {
        this.registerPageMode.set(RegisterMode.Submitting);

        if (environment.recaptchaKey != '') {
            this.reCaptchaV3Service.execute(environment.recaptchaKey, 'homepage', async (token) => {
                await this.registerUser(token);
            });
        } else {
            await this.registerUser('');
        }
    }

    protected onPasswordValid(valid: boolean): void {
        this.passwordIsValid.set(valid);
    }

    protected onRegisterClick(): void {
        this.registerPageMode.set(RegisterMode.Register);
    }

    private async registerUser(token: string): Promise<void> {
        try {
            const user = new RegisterUser();
            user.redirectBaseUrl = this.windowService.getApplicationUrl();
            user.securityToken = token;

            user.userName = this.userName();
            user.email = this.email();
            user.name = this.fullName();
            user.locale = this.locale();
            user.password = this.password();
            user.agreement = this.agreement();
            user.inviteToken = this.inviteToken();
            user.reason = this.reason();

            await this.registerService.register(user);
            this.removeGoogleBadge();

            this.messageService.showSuccess('Your account has been created.');
            await this.router.navigate(['/login']);
        } catch (error: any) {
            if (error.error.code === 'userNameIsAlreadyTaken') {
                this.errorMessage.set('User name is already taken. Please choose different one.');
            } else if (error.error.code === 'emailIsAlreadyConnected') {
                this.errorMessage.set('Given email is already connected with other account.');
            } else if (error.error.code === 'invitationTokenIsInvalid') {
                this.errorMessage.set('Invitation token is invalid.');
            } else if (error.error.code === 'invitationTokenHasBeenUsed') {
                this.errorMessage.set('Invitation token has been used.');
            } else if (error.error.code === 'userHaveToAcceptAgreement') {
                this.errorMessage.set('You have to accept server rules.');
            } else if (error.error.code === 'disposableEmailCannotBeUsed') {
                this.errorMessage.set('Disposable email cannot be used.');
            } else {
                this.errorMessage.set('Unexpected error occurred. Please try again.');
            }

            this.registerPageMode.set(RegisterMode.Error);
        }
    }

    private removeGoogleBadge(): void {
        const googleBadge = this.document.getElementsByClassName('grecaptcha-badge');
        if (googleBadge && googleBadge.length > 0) {
            googleBadge[0].remove();
        }
    }
}
