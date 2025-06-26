import { Component, OnInit, signal, model, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { RegisterUser } from 'src/app/models/register-user';

import { RegisterMode } from 'src/app/models/register-mode';
import { InstanceService } from 'src/app/services/http/instance.service';
import { RegisterService } from 'src/app/services/http/register.service';
import { WindowService } from 'src/app/services/common/window.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { Router } from '@angular/router';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Rule } from 'src/app/models/rule';
import { SettingsService } from 'src/app/services/http/settings.service';

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
    protected apiUrl = model('');
    protected securityText = model('');
    protected securityKey = signal('');

    protected registerPageMode = signal(RegisterMode.Register);
    protected passwordIsValid = signal(false);
    protected errorMessage = signal<string | undefined>(undefined);
    protected isRegistrationByApprovalOpened = signal(false);
    protected isRegistrationByInvitationsOpened = signal(false);
    protected isQuickCaptchaEnabled = signal(false);
    protected serverRules = signal<Rule[]>([]);

    protected isSubmittingMode = computed(() => this.registerPageMode() === RegisterMode.Submitting);
    protected isErrorMode = computed(() => this.registerPageMode() === RegisterMode.Error);

    private registerService = inject(RegisterService);
    private router = inject(Router);
    private messageService = inject(MessagesService);
    private instanceService = inject(InstanceService);
    private settingsService = inject(SettingsService);
    private windowService = inject(WindowService);

    constructor() {
        // Generate a random security key for the registration captcha.
        this.apiUrl.set(this.windowService.apiUrl());
        this.securityKey.set(this.generateKey(16));
    }

    ngOnInit(): void {
        if (!this.instanceService.isRegistrationEnabled()) {
            throw new ForbiddenError();
        }

        this.isRegistrationByApprovalOpened.set(this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByApprovalOpened === true);
        this.isRegistrationByInvitationsOpened.set(this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByInvitationsOpened === true);
        this.isQuickCaptchaEnabled.set(this.instanceService.instance?.registrationOpened === true && this.settingsService.publicSettings?.isQuickCaptchaEnabled === true);

        this.serverRules.set(this.instanceService.instance?.rules ?? []);
    }

    async onSubmit(): Promise<void> {
        this.registerPageMode.set(RegisterMode.Submitting);
        await this.registerUser();
    }

    protected onPasswordValid(valid: boolean): void {
        this.passwordIsValid.set(valid);
    }

    protected onRegisterClick(): void {
        this.registerPageMode.set(RegisterMode.Register);
    }

    protected onCaptchaRefreshClick(): void {
        this.securityKey.set(this.generateKey(16));
    }

    private async registerUser(): Promise<void> {
        try {
            const user = new RegisterUser();
            user.redirectBaseUrl = this.windowService.getApplicationUrl();
            user.securityToken = `${this.securityKey()}/${this.securityText()}`;

            user.userName = this.userName();
            user.email = this.email();
            user.name = this.fullName();
            user.locale = this.locale();
            user.password = this.password();
            user.agreement = this.agreement();
            user.inviteToken = this.inviteToken();
            user.reason = this.reason();

            await this.registerService.register(user);

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

    private generateKey(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
