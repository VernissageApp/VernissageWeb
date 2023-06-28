import { Component, OnInit } from '@angular/core';
import { IdentityService } from 'src/app/services/http/identity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IdentityToken } from 'src/app/models/identity-token';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

@Component({
    selector: 'app-login-callback',
    templateUrl: './login-callback.page.html',
    styleUrls: ['./login-callback.page.scss']
})
export class LoginCallbackPage implements OnInit {
    public errorMessage?: string;

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
            this.authorizationService.signIn(accessToken);
            this.router.navigate(['/home']);
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
        }
    }
}
