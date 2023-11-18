import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from './authorization.service';
import { inject } from '@angular/core';

export const authorizationGuard = (_: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authorizationService = inject(AuthorizationService);
    const router = inject(Router);

    if (!authorizationService.isLoggedIn()) {
        authorizationService.signOut();
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });

        return false;
    }

    return true;
};
