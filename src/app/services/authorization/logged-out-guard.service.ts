import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from './authorization.service';

export const loggedOutGuard = (_: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authorizationService = inject(AuthorizationService);
    const router = inject(Router);

    if (authorizationService.isLoggedIn()) {
        router.navigate(['/home']);

        return false;
    }

    return true;
};
