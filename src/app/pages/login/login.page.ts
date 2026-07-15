import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouteReuseStrategy, RouterLink } from '@angular/router';

import { Login } from 'src/app/models/login';
import { LoginMode } from 'src/app/models/login-mode';
import { AccountService } from 'src/app/services/http/account.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { DirtyErrorStateMatcher } from 'src/app/common/dirty-error-state-matcher';
import { AuthClientsService } from 'src/app/services/http/auth-clients.service';
import { AuthClient } from 'src/app/models/auth-client';
import { InstanceService } from 'src/app/services/http/instance.service';
import { WindowService } from 'src/app/services/common/window.service';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';
import { AlwaysErrorStateMatcher } from 'src/app/common/always-error-state-mather';
import { PushSubscriptionsService } from 'src/app/services/http/push-subscriptions.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatCardFooter } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FooterComponent } from '../../components/core/footer/footer.component';
import { SanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatFormField, MatLabel, InputActivityDirective, MatInput, MatError, RouterLink, MatCheckbox, MatCardActions, MatButton, MatProgressSpinner, MatCardFooter, FooterComponent, TranslatePipe, SanitizeHtmlPipe]
})
export class LoginPage implements OnInit {
    protected readonly loginMode = LoginMode;

    protected userNameOrEmail = model('');
    protected password = model('');
    protected trustMachine = model(false);
    protected twoFactorToken = model('');
    protected authClients = signal<AuthClient[] | undefined>(undefined);
    protected isSubmitting = signal(false);
    protected isRegistrationEnabled = signal(false);

    protected loginPageMode = signal(LoginMode.UserNameAndPassword);
    protected dirtyErrorStateMatcher = new DirtyErrorStateMatcher();
    protected alwaysErrorStateMatcher = new AlwaysErrorStateMatcher();

    protected errorMessage = signal<string | undefined>(undefined);
    protected tokenMessage = signal<string | undefined>(undefined);

    private returnUrl?: string;

    private clientId?: string;
    private scope?: string;
    private redirectUri?: string;
    private state?: string;
    private nonce?: string;
    private csrfToken?: string;

    private accountService = inject(AccountService);
    private router = inject(Router);
    private authorizationService = inject(AuthorizationService);
    private instanceService = inject(InstanceService);
    private route = inject(ActivatedRoute);
    private routeReuseStrategy = inject(RouteReuseStrategy);
    private windowService = inject(WindowService);
    private pushSubscriptionsService = inject(PushSubscriptionsService);
    private authClientsService = inject(AuthClientsService);
    private translateService = inject(TranslateService);

    async ngOnInit(): Promise<void> {
        this.route.queryParams.subscribe(async (params) => {
            this.returnUrl = params.returnUrl;

            this.clientId = params.client_id;
            this.scope = params.scope;
            this.redirectUri = params.redirect_uri;
            this.state = params.state ?? '';
            this.nonce = params.nonce ?? '';
            this.csrfToken = params.csrf_token ?? '';
        });

        const downloadAuthClients = await this.authClientsService.getList();
        this.authClients.set(downloadAuthClients);
        this.isRegistrationEnabled.set(this.instanceService.isRegistrationEnabled());
    }

    protected onCancelTwoFactor(): void {
        this.twoFactorToken.set('');
        this.tokenMessage.set(undefined);
        this.loginPageMode.set(LoginMode.UserNameAndPassword);
    }

    protected async onSubmit(): Promise<void> {
        this.isSubmitting.set(true);

        try {
            this.clearReuseStrategyState();

            const login = new Login(this.userNameOrEmail().trim(), this.password(), this.trustMachine());
            const userPayloadToken = await this.accountService.login(login, this.twoFactorToken());

            await this.authorizationService.signIn(userPayloadToken);
            await this.pushSubscriptionsService.updatePushSubscription();

            if (this.clientId && this.scope && this.redirectUri) {
                // If the user logged in and we've params in query string, redirect to the OAuth authorization endpoint.
                await this.windowService.redirect(this.windowService.apiUrl() + '/api/v1/oauth/authorize?client_id=' + this.clientId 
                    + '&redirect_uri=' + this.redirectUri + '&response_type=code&scope=' + this.scope + '&state=' 
                    + this.state + '&nonce=' + this.nonce + '&csrf_token=' + this.csrfToken);
            } else if (this.returnUrl) {
                await this.router.navigateByUrl(this.returnUrl);
            } else {
                await this.router.navigate(['/home']);
            }
        } catch (error: any) {
            this.errorMessage.set(undefined);

            if (error.error.code === 'twoFactorTokenNotFound') {
                this.tokenMessage.set(this.translateService.instant('pages.login.errors.enterTwoFactorToken'));
                this.loginPageMode.set(LoginMode.TwoFactorToken);
            } else if (error.error.code === 'tokenNotValid') {
                this.tokenMessage.set(this.translateService.instant('pages.login.errors.twoFactorTokenNotValid'));
            } else if (error.error.code === 'invalidLoginCredentials') {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.invalidCredentials'));
            } else if (error.error.code === 'loginAttemptsExceeded') {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.loginAttemptsExceeded'));
            } else if (error.error.code === 'userAccountIsBlocked') {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.accountBlocked'));
            } else if (error.error.code === 'userAccountIsNotApproved') {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.accountNotApproved'));
            } else {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.unknownLoginError'));
            }
        } finally {
            this.isSubmitting.set(false);
        }
    }

    protected getExternalProviderUrl(authClient: AuthClient): string {
        return this.windowService.apiUrl() + '/identity/authenticate/' + authClient.uri;
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        if (customReuseStrategy) {
            customReuseStrategy.clear();
        }
    }
}
