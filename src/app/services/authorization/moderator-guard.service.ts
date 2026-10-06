import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../models/role';
import { AuthorizationService } from './authorization.service';
import { authorizationGuard } from './authorization-guard.service';

export const moderatorGuard: CanActivateFn = async (route, state) => {
    const authorizationService = inject(AuthorizationService);
    const router = inject(Router);

    if (!await authorizationGuard(route, state)) {
        return false;
    }

    if (authorizationService.hasRole(Role.Administrator) || authorizationService.hasRole(Role.Moderator)) {
        return true;
    }

    return router.createUrlTree(['/access-forbidden']);
};
