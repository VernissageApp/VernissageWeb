import { Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    animations: fadeInAnimation
})
export class LoginPage implements OnInit {
    readonly LoginMode = LoginMode;

    login = new Login('', '');
    twoFactorToken = '';
    loginMode = LoginMode.UserNameAndPassword;
    dirtyErrorStateMatcher = new DirtyErrorStateMatcher();
    alwaysErrorStateMatcher = new AlwaysErrorStateMatcher();

    errorMessage?: string;
    tokenMessge?: string;
    returnUrl?: string;
    authClients?: AuthClient[];
    isSubmitting = false;

    constructor(
        private accountService: AccountService,
        private router: Router,
        private authorizationService: AuthorizationService,
        private instanceService: InstanceService,
        private route: ActivatedRoute,
        private routeReuseStrategy: RouteReuseStrategy,
        private windowService: WindowService,
        private authClientsService: AuthClientsService) {
    }

    async ngOnInit(): Promise<void> {
        this.route.queryParams.subscribe(async (params) => {
            this.returnUrl = params.returnUrl;
        });

        this.authClients = await this.authClientsService.getList();
    }

    onCancelTwoFactor(): void {
        this.twoFactorToken = '';
        this.tokenMessge = undefined;
        this.loginMode = LoginMode.UserNameAndPassword;
    }

    async onSubmit(): Promise<void> {
        this.isSubmitting = true;

        try {
            this.clearReuseStrategyState();
            const userPayloadToken = await this.accountService.login(this.login, this.twoFactorToken);
            await this.authorizationService.signIn(userPayloadToken);

            if (this.returnUrl) {
                await this.router.navigateByUrl(this.returnUrl);
            } else {
                await this.router.navigate(['/home']);
            }
        } catch (error: any) {
            this.errorMessage = undefined;

            if (error.error.code === 'twoFactorTokenNotFound') {
                this.tokenMessge = 'Enter token from authentication app.';
                this.loginMode = LoginMode.TwoFactorToken;
            } else if (error.error.code === 'tokenNotValid') {
                this.tokenMessge = 'Token is not valid. Plase enter new token.';
            } else if (error.error.code === 'invalidLoginCredentials') {
                this.errorMessage = 'Invalid credentials.';
            } else if (error.error.code === 'emailNotConfirmed') {
                this.errorMessage = 'Your email is not confirmed. Check your inbox or reset your password.';
            } else if (error.error.code === 'userAccountIsBlocked') {
                this.errorMessage = 'Your account is blocked. Contact with our support.';
            } else if (error.error.code === 'userAccountIsNotApproved') {
                this.errorMessage = 'Your account is not approved yet.';
            } else {
                this.errorMessage = 'Unknown login error. Try again later.';
            }
        } finally {
            this.isSubmitting = false;
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
