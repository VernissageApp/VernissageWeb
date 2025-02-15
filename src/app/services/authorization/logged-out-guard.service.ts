import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from './authorization.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loggedOutGuard = async (_: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const authorizationService = inject(AuthorizationService);
    const router = inject(Router);

    const isLoggedIn = await authorizationService.isLoggedIn();
    if (isLoggedIn) {
        router.navigate(['/home']);

        return false;
    }

    return true;
};
