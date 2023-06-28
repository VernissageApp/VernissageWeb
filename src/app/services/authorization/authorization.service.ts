import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from 'src/app/models/user';
import { PersistanceService } from '../persistance/persistance.service';
import { AccountService } from '../http/account.service';
import { AccessToken } from '../../models/access-token';

@Injectable({
    providedIn: 'root'
})
export class AuthorizationService {

    public changes = new BehaviorSubject<User | null>(this.getUser());
    private sessionTimeout?: NodeJS.Timeout;
    private tokenProcessingTime = 30;
    private oneSecond = 1000;

    constructor(
        private jwtHelperService: JwtHelperService,
        private persistanceService: PersistanceService,
        private accountService: AccountService,
        private zone: NgZone) {
    }

    isLoggedIn(): boolean {

        const actionToken = this.persistanceService.getAccessToken();
        if (!actionToken) {
            return false;
        }

        if (this.jwtHelperService.isTokenExpired(actionToken)) {
            return false;
        }

        return true;
    }

    getUser(): User | null {

        const actionToken = this.persistanceService.getAccessToken();
        if (!actionToken) {
            return null;
        }

        const decodedToken = this.jwtHelperService.decodeToken(actionToken);

        const user = new User();
        user.id = decodedToken.id;
        user.email = decodedToken.email;
        user.name = decodedToken.name;
        user.userName = decodedToken.userName;
        user.gravatarHash = decodedToken.gravatarHash;

        return user;
    }

    signIn(accessToken: AccessToken): void {
        this.persistanceService.setAccessToken(accessToken.accessToken);
        this.persistanceService.setRefreshToken(accessToken.refreshToken);

        const user = this.getUser();
        this.changes.next(user);

        const tokenExpirationTime = this.getTokenExpirationTime();
        if (tokenExpirationTime == null) {
            this.signOut();
            return;
        }

        const now = new Date();
        const expirationTime = tokenExpirationTime.getTime();
        const tokenExpirationSeconds = Math.round(expirationTime / this.oneSecond);
        const nowSeconds = Math.round(now.getTime() / this.oneSecond);

        const sessionTimeout = (tokenExpirationSeconds - nowSeconds) - this.tokenProcessingTime;
        this.initSessionTimeout(sessionTimeout);
    }

    signOut(): void {
        this.cancelSessionTimeout();
        this.persistanceService.removeAccessToken();
        this.persistanceService.removeRefreshToken();
        this.changes.next(null);
    }

    async refreshAccessToken(): Promise<void> {
        const refreshToken = this.persistanceService.getRefreshToken();
        if (!refreshToken) {
            return;
        }

        try {
            const refreshedAccessToken = await this.accountService.refreshToken(refreshToken);
            this.signIn(refreshedAccessToken);
        } catch {
            this.signOut();
        }
    }

    private getTokenExpirationTime(): Date | null {
        const actionToken = this.persistanceService.getAccessToken();
        if (!actionToken) {
            return null;
        }

        const decodedToken = this.jwtHelperService.decodeToken(actionToken);

        return new Date(Math.round(decodedToken.exp * this.oneSecond));
    }

    private initSessionTimeout(seconds: number): void {
        this.zone.runOutsideAngular(() => {
            this.sessionTimeout = setTimeout(
                async () => this.refreshAccessToken(),
                this.oneSecond * seconds
            );
        });
    }

    private cancelSessionTimeout(): void {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
    }
}
