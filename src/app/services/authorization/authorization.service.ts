import { Inject, Injectable, NgZone, PLATFORM_ID, isDevMode } from '@angular/core';
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
    private tokenProcessingTime = 30;
    private oneSecond = 1000;
    private userPayloadToken?: UserPayloadToken;
    private isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        private accountService: AccountService,
        private zone: NgZone) {
            this.isBrowser = isPlatformBrowser(platformId);
    }

    isLoggedIn(): boolean {
        if (!this.userPayloadToken) {
            return false;
        }

        const expirationDate = this.getTokenExpirationTime();
        if (!expirationDate) {
            return false;
        }

        const now = new Date();
        if (expirationDate < now) {
            return false;
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
        this.userPayloadToken = userPayloadToken;
        this.changes.next(this.userPayloadToken.userPayload);

        const tokenExpirationTime = this.getTokenExpirationTime();
        if (tokenExpirationTime == null) {
            await this.signOut();
            return;
        }

        const now = new Date();
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

    async refreshAccessToken(): Promise<void> {
        try {
            const refresheUserPayloadToken = await this.accountService.refreshToken();
            if (refresheUserPayloadToken) {
                await this.signIn(refresheUserPayloadToken);
            } else {
                await this.signOut();
            }
        } catch (error) {
            if ((error instanceof ServerRefreshTokenNotExistsError) === false) {
                await this.signOut();
            }
        }
    }

    private getTokenExpirationTime(): Date | null {
        if (!this.userPayloadToken) {
            return null;
        }

        return new Date(this.userPayloadToken.expirationDate);
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
