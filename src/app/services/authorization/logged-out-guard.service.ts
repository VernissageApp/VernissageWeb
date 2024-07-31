import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from './authorization.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loggedOutGuard = (_: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const authorizationService = inject(AuthorizationService);
    const router = inject(Router);

    if (authorizationService.isLoggedIn()) {
        router.navigate(['/home']);

        return false;
    }

    return true;
};
