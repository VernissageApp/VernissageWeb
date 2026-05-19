import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { IdentityService } from 'src/app/services/http/identity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IdentityToken } from 'src/app/models/identity-token';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login-callback',
    templateUrl: './login-callback.page.html',
    styleUrls: ['./login-callback.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LoginCallbackPage implements OnInit {
    protected errorMessage = signal<string | undefined>(undefined);

    private identityService = inject(IdentityService);
    private route = inject(ActivatedRoute);
    private authorizationService = inject(AuthorizationService);
    private router = inject(Router);
    private translateService = inject(TranslateService);

    async ngOnInit(): Promise<void> {
        const authenticateToken = this.route.snapshot.queryParams.authenticateToken;

        try {
            const accessToken = await this.identityService.login(new IdentityToken(authenticateToken));
            await this.authorizationService.signIn(accessToken);
            await this.router.navigate(['/home']);
        } catch (error: any) {

            if (error.error.code === 'invalidLoginCredentials') {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.invalidCredentials'));
            } else if (error.error.code === 'emailNotConfirmed') {
                this.errorMessage.set(this.translateService.instant('pages.loginCallback.errors.emailNotConfirmed'));
            } else if (error.error.code === 'userAccountIsBlocked') {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.accountBlocked'));
            } else {
                this.errorMessage.set(this.translateService.instant('pages.login.errors.unknownLoginError'));
            }
        }
    }
}
