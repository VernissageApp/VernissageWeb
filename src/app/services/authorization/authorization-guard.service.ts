import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthorizationService } from './authorization.service';

@Injectable({
    providedIn: 'root'
})
export class AuthorizationGuardService implements CanActivate {

    constructor(
        public authorizationService: AuthorizationService,
        public router: Router
    ) { }

    async canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

        if (!this.authorizationService.isLoggedIn()) {
            this.authorizationService.signOut();
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });

            return false;
        }

        return true;
    }
}
