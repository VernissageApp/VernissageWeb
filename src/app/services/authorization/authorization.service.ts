import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user';
import { AccountService } from '../http/account.service';
import { UserPayloadToken } from '../../models/user-payload-token';
import { Role } from 'src/app/models/role';
import { ServerRefreshTokenNotExistsError } from 'src/app/errors/server-refresh-token-not-exists-error';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthorizationService {
    public changes = new BehaviorSubject<User | undefined>(this.getUser());
    private sessionTimeout?: NodeJS.Timeout;
    private tokenProcessingTime = 120;
    private oneSecond = 1000;
    private userPayloadToken?: UserPayloadToken;
    private isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private accountService: AccountService,
        private zone: NgZone) {
            this.isBrowser = isPlatformBrowser(platformId);
    }

    async isLoggedIn(): Promise<boolean> {
        if (!this.userPayloadToken) {
            return false;
        }

        const tokenExpirationTime = new Date(this.userPayloadToken.expirationDate);
        if (!tokenExpirationTime) {
            return false;
        }

        const now = new Date();
        if (tokenExpirationTime < now) {
            return this.refreshAccessToken();
        }

        return true;
    }

    getUser(): User | undefined {
        if (!this.userPayloadToken) {
            return undefined;
        }

        return this.userPayloadToken.userPayload;
    }

    hasRole(role: Role): boolean {
        if (!this.userPayloadToken || !this.userPayloadToken.userPayload || !this.userPayloadToken.userPayload.roles) {
            return false;
        }

        return this.userPayloadToken.userPayload.roles.includes(role);    
    }

    async signIn(userPayloadToken: UserPayloadToken): Promise<void> {
        if (!userPayloadToken) {
            await this.signOut();
            return;
        }

        const tokenExpirationTime = new Date(userPayloadToken.expirationDate);
        if (!tokenExpirationTime) {
            await this.signOut();
            return;
        }

        const now = new Date();
        if (tokenExpirationTime < now) {
            await this.signOut();
            return;
        }

        this.userPayloadToken = userPayloadToken;
        this.changes.next(this.userPayloadToken.userPayload);

        const expirationTime = tokenExpirationTime.getTime();
        const tokenExpirationSeconds = Math.round(expirationTime / this.oneSecond);
        const nowSeconds = Math.round(now.getTime() / this.oneSecond);

        const sessionTimeout = (tokenExpirationSeconds - nowSeconds) - this.tokenProcessingTime;
        this.initSessionTimeout(sessionTimeout);
    }

    async signOut(): Promise<void> {
        this.cancelSessionTimeout();
        this.userPayloadToken = undefined;

        if (this.isBrowser) {
            await this.accountService.logout();
        }

        this.changes.next(undefined);
    }

    async refreshAccessToken(): Promise<boolean> {
        try {
            const refreshUserPayloadToken = await this.accountService.refreshToken();
            if (refreshUserPayloadToken) {
                await this.signIn(refreshUserPayloadToken);
                return true;
            } else {
                await this.signOut();
                return false;
            }
        } catch (error) {
            if ((error instanceof ServerRefreshTokenNotExistsError) === false) {
                await this.signOut();
            }

            return false;
        }
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
