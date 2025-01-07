import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user';
import { AccountService } from '../http/account.service';
import { UserPayloadToken } from '../../models/user-payload-token';
import { Role } from 'src/app/models/role';
import { ServerRefreshTokenNotExistsError } from 'src/app/errors/server-refresh-token-not-exists-error';
import { isPlatformBrowser } from '@angular/common';
import { PersistenceService } from '../persistance/persistance.service';

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
    private readonly xsrfTokenName = 'xsrf-token';

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private accountService: AccountService,
        private persistenceService: PersistenceService,
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
            const resultRefreshAccessToken = await this.refreshAccessToken();
            return resultRefreshAccessToken;
        }

        return true;
    }

    getUser(): User | undefined {
        if (!this.userPayloadToken) {
            return undefined;
        }

        return this.userPayloadToken.userPayload;
    }

    getXsrfToken(): string {
        const xsrfTokenFromStorage = this.persistenceService.get(this.xsrfTokenName);
        return xsrfTokenFromStorage ?? 'unknown';
    }

    hasRole(role: Role): boolean {
        if (!this.userPayloadToken || !this.userPayloadToken.userPayload || !this.userPayloadToken.userPayload.roles) {
            return false;
        }

        return this.userPayloadToken.userPayload.roles.includes(role);    
    }

    async signIn(userPayloadToken: UserPayloadToken): Promise<boolean> {
        if (!userPayloadToken) {
            await this.signOut();
            return false;
        }

        const tokenExpirationTime = new Date(userPayloadToken.expirationDate);
        if (!tokenExpirationTime) {
            await this.signOut();
            return false;
        }

        const now = new Date();
        if (tokenExpirationTime < now) {
            await this.signOut();
            return false;
        }

        this.userPayloadToken = userPayloadToken;
        this.persistenceService.set(this.xsrfTokenName, userPayloadToken.xsrfToken);

        const expirationTime = tokenExpirationTime.getTime();
        const tokenExpirationSeconds = Math.round(expirationTime / this.oneSecond);
        const nowSeconds = Math.round(now.getTime() / this.oneSecond);

        const sessionTimeout = (tokenExpirationSeconds - nowSeconds) - this.tokenProcessingTime;
        this.initSessionTimeout(sessionTimeout);

        this.changes.next(this.userPayloadToken.userPayload);
        return true;
    }

    async signOut(): Promise<void> {
        this.cancelSessionTimeout();
        
        if (this.isBrowser && this.userPayloadToken)  {
            this.userPayloadToken = undefined;
            this.persistenceService.remove(this.xsrfTokenName);

            await this.accountService.logout();
        } else {
            this.userPayloadToken = undefined;
            this.persistenceService.remove(this.xsrfTokenName);
        }

        this.changes.next(undefined);
    }

    async refreshAccessToken(): Promise<boolean> {
        try {
            const refreshUserPayloadToken = await this.accountService.refreshToken();
            if (refreshUserPayloadToken) {
                const signInResult = await this.signIn(refreshUserPayloadToken);
                return signInResult;
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
