import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthorizationService } from './authorization.service';
import { inject } from '@angular/core';

export const authorizationGuard = async (_: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authorizationService = inject(AuthorizationService);
    const router = inject(Router);

    const isLoggedIn = await authorizationService.isLoggedIn();
    if (!isLoggedIn) {
        await authorizationService.signOut();
        await router.navigate(['/login'], { queryParams: { returnUrl: state.url } });

        return false;
    }

    return true;
};
