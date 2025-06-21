import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from './authorization.service';
import { WindowService } from '../common/window.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loggedOutGuard = async (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const authorizationService = inject(AuthorizationService);
    const router = inject(Router);
    const windowService = inject(WindowService);

    const isLoggedIn = await authorizationService.isLoggedIn();
    if (isLoggedIn) {
        const clientId = route.queryParams.client_id;
        const scope = route.queryParams.scope;
        const redirectUri = route.queryParams.redirect_uri;
        const state = route.queryParams.state ?? '';
        const nonce = route.queryParams.nonce ?? '';
        const csrfToken = route.queryParams.csrf_token ?? '';

        // If the user is logged in and we've params in query string, redirect to the OAuth authorization endpoint.
        if (clientId && scope && redirectUri) {
            windowService.redirect(windowService.apiUrl() + '/api/v1/oauth/authorize?client_id=' + clientId 
                + '&redirect_uri=' + redirectUri + '&response_type=code&scope=' + scope + '&state=' 
                + state + '&nonce=' + nonce + '&csrf_token=' + csrfToken);
        } else {
            router.navigate(['/home']);
        }

        return false;
    }

    return true;
};
