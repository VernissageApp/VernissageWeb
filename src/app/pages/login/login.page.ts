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
    loginMode = LoginMode.Login;
    dirtyErrorStateMatcher = new DirtyErrorStateMatcher();

    errorMessage?: string;
    returnUrl?: string;
    authClients?: AuthClient[];
    showTwoTokenField = false;

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

    onUserNameOrEmailChanged(): void {
        this.showTwoTokenField = false;
    }

    onPasswordChanged(): void {
        this.showTwoTokenField = false;
    }

    async onSubmit(): Promise<void> {
        this.loginMode = LoginMode.Submitting;

        try {
            this.clearReuseStrategyState();
            const accessToken = await this.accountService.login(this.login, this.twoFactorToken);
            this.authorizationService.signIn(accessToken);

            if (this.returnUrl) {
                await this.router.navigateByUrl(this.returnUrl);
            } else {
                await this.router.navigate(['/home']);
            }
        } catch (error: any) {

            if (error.error.code === 'twoFactorTokenNotFound') {
                this.showTwoTokenField = true;
                this.errorMessage = 'Enter token from authentication app.';
            } else if (error.error.code === 'tokenNotValid') {
                this.showTwoTokenField = true;
                this.errorMessage = 'Token is not valid. Plase enter new token.';
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

            this.loginMode = LoginMode.Error;
        }
    }

    getExternalProviderUrl(authClient: AuthClient): string {
        return this.windowService.apiUrl() + '/identity/authenticate/' + authClient.uri;
    }

    isSubmittingMode(): boolean {
        return this.loginMode === LoginMode.Submitting;
    }

    isErrorMode(): boolean {
        return this.loginMode === LoginMode.Error;
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
