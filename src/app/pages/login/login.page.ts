import { Component, model, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouteReuseStrategy } from '@angular/router';

import { Login } from 'src/app/models/login';
import { LoginMode } from 'src/app/models/login-mode';
import { AccountService } from 'src/app/services/http/account.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { DirtyErrorStateMatcher } from 'src/app/common/dirty-error-state-matcher';
import { AuthClientsService } from 'src/app/services/http/auth-clients.service';
import { AuthClient } from 'src/app/models/auth-client';
import { InstanceService } from 'src/app/services/http/instance.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { WindowService } from 'src/app/services/common/window.service';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';
import { AlwaysErrorStateMatcher } from 'src/app/common/always-error-state-mather';
import { PushSubscriptionsService } from 'src/app/services/http/push-subscriptions.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class LoginPage implements OnInit {
    protected readonly loginMode = LoginMode;

    protected userNameOrEmail = model('');
    protected password = model('');
    protected trustMachine = model(false);
    protected twoFactorToken = model('');
    protected authClients = signal<AuthClient[] | undefined>(undefined);
    protected isSubmitting = signal(false);

    protected loginPageMode = signal(LoginMode.UserNameAndPassword);
    protected dirtyErrorStateMatcher = new DirtyErrorStateMatcher();
    protected alwaysErrorStateMatcher = new AlwaysErrorStateMatcher();

    protected errorMessage = signal<string | undefined>(undefined);
    protected tokenMessage = signal<string | undefined>(undefined);

    private returnUrl?: string;

    constructor(
        private accountService: AccountService,
        private router: Router,
        private authorizationService: AuthorizationService,
        private instanceService: InstanceService,
        private route: ActivatedRoute,
        private routeReuseStrategy: RouteReuseStrategy,
        private windowService: WindowService,
        private pushSubscriptionsService: PushSubscriptionsService,
        private authClientsService: AuthClientsService) {
    }

    async ngOnInit(): Promise<void> {
        this.route.queryParams.subscribe(async (params) => {
            this.returnUrl = params.returnUrl;
        });

        const downloadAuthClients = await this.authClientsService.getList();
        this.authClients.set(downloadAuthClients);
    }

    onCancelTwoFactor(): void {
        this.twoFactorToken.set('');
        this.tokenMessage.set(undefined);
        this.loginPageMode.set(LoginMode.UserNameAndPassword);
    }

    async onSubmit(): Promise<void> {
        this.isSubmitting.set(true);

        try {
            this.clearReuseStrategyState();

            const login = new Login(this.userNameOrEmail(), this.password(), this.trustMachine());
            const userPayloadToken = await this.accountService.login(login, this.twoFactorToken());

            await this.authorizationService.signIn(userPayloadToken);
            await this.pushSubscriptionsService.updatePushSubscription();

            if (this.returnUrl) {
                await this.router.navigateByUrl(this.returnUrl);
            } else {
                await this.router.navigate(['/home']);
            }
        } catch (error: any) {
            this.errorMessage.set(undefined);

            if (error.error.code === 'twoFactorTokenNotFound') {
                this.tokenMessage.set('Enter token from authentication app.');
                this.loginPageMode.set(LoginMode.TwoFactorToken);
            } else if (error.error.code === 'tokenNotValid') {
                this.tokenMessage.set('Token is not valid. Please enter new token.');
            } else if (error.error.code === 'invalidLoginCredentials') {
                this.errorMessage.set('Invalid credentials.');
            } else if (error.error.code === 'emailNotConfirmed') {
                this.errorMessage.set('Your email is not confirmed. Check your inbox or reset your password.');
            } else if (error.error.code === 'userAccountIsBlocked') {
                this.errorMessage.set('Your account is blocked. Contact with our support.');
            } else if (error.error.code === 'userAccountIsNotApproved') {
                this.errorMessage.set('Your account is not approved yet.');
            } else {
                this.errorMessage.set('Unknown login error. Try again later.');
            }
        } finally {
            this.isSubmitting.set(false);
        }
    }

    getExternalProviderUrl(authClient: AuthClient): string {
        return this.windowService.apiUrl() + '/identity/authenticate/' + authClient.uri;
    }

    isRegistrationEnabled(): boolean {
        return this.instanceService.isRegistrationEnabled();
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        if (customReuseStrategy) {
            customReuseStrategy.clear();
        }
    }
}
