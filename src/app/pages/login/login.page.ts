import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Login } from 'src/app/models/login';
import { LoginMode } from 'src/app/models/login-mode';
import { AccountService } from 'src/app/services/http/account.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { DirtyErrorStateMatcher } from 'src/app/common/DirtyErrorStateMatcher';
import { AuthClientsService } from 'src/app/services/http/auth-clients.service';
import { AuthClient } from 'src/app/models/auth-client';
import { InstanceService } from 'src/app/services/http/instance.service';
import { environment } from 'src/environments/environment';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    animations: fadeInAnimation
})
export class LoginPage implements OnInit {
    readonly LoginMode = LoginMode;

    login = new Login('', '');
    loginMode = LoginMode.Login;
    dirtyErrorStateMatcher = new DirtyErrorStateMatcher();

    errorMessage?: string;
    returnUrl?: string;
    authClients?: AuthClient[];

    constructor(
        private accountService: AccountService,
        private router: Router,
        private authorizationService: AuthorizationService,
        private instanceService: InstanceService,
        private route: ActivatedRoute,
        private authClientsService: AuthClientsService) {
    }

    async ngOnInit(): Promise<void> {
        this.route.queryParams.subscribe(async (params) => {
            this.returnUrl = params.returnUrl;
        });

        this.authClients = await this.authClientsService.getList();
    }

    async onSubmit(): Promise<void> {
        this.loginMode = LoginMode.Submitting;

        try {
            const accessToken = await this.accountService.login(this.login);
            this.authorizationService.signIn(accessToken);

            if (this.returnUrl) {
                await this.router.navigateByUrl(this.returnUrl);
            } else {
                await this.router.navigate(['/home']);
            }
        } catch (error: any) {

            if (error.error.code === 'invalidLoginCredentials') {
                this.errorMessage = 'Invalid credentials.';
            } else if (error.error.code === 'emailNotConfirmed') {
                this.errorMessage = 'Your email is not confirmed. Check your inbox or reset your password.';
            } else if (error.error.code === 'userAccountIsBlocked') {
                this.errorMessage = 'Your account is blocked. Contact with our support.';
            } else {
                this.errorMessage = 'Unknown login error. Try again later.';
            }

            this.loginMode = LoginMode.Error;
        }
    }

    getExternalProviderUrl(authClient: AuthClient): string {
        return environment.httpSchema + environment.apiService + '/identity/authenticate/' + authClient.uri;
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
}
