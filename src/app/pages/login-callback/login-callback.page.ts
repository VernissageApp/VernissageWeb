import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { IdentityService } from 'src/app/services/http/identity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IdentityToken } from 'src/app/models/identity-token';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

@Component({
    selector: 'app-login-callback',
    templateUrl: './login-callback.page.html',
    styleUrls: ['./login-callback.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LoginCallbackPage implements OnInit {
    protected errorMessage = signal<string | undefined>(undefined);

    constructor(
        private identityService: IdentityService,
        private route: ActivatedRoute,
        private authorizationService: AuthorizationService,
        private router: Router) {
    }

    async ngOnInit(): Promise<void> {
        const authenticateToken = this.route.snapshot.queryParams.authenticateToken;

        try {
            const accessToken = await this.identityService.login(new IdentityToken(authenticateToken));
            await this.authorizationService.signIn(accessToken);
            await this.router.navigate(['/home']);
        } catch (error: any) {

            if (error.error.code === 'invalidLoginCredentials') {
                this.errorMessage.set('Invalid credentials.');
            } else if (error.error.code === 'emailNotConfirmed') {
                this.errorMessage.set('Your email is not confirmed. Check your inbox or reset your password.');
            } else if (error.error.code === 'userAccountIsBlocked') {
                this.errorMessage.set('Your account is blocked. Contact with our support.');
            } else {
                this.errorMessage.set('Unknown login error. Try again later.');
            }
        }
    }
}
