import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthorizationService } from './authorization.service';

@Injectable({
    providedIn: 'root'
})
export class LoggedOutGuardService implements CanActivate {

    constructor(
        public authorizationService: AuthorizationService,
        public router: Router
    ) { }

    async canActivate(): Promise<boolean> {

        if (this.authorizationService.isLoggedIn()) {
            this.router.navigate(['/home']);

            return false;
        }

        return true;
    }
}
