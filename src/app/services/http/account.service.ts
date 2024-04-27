import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChangeEmail } from 'src/app/models/change-email';
import { UserPayloadToken } from 'src/app/models/user-payload-token';
import { Login } from 'src/app/models/login';
import { ChangePassword } from 'src/app/models/change-password';
import { RefreshToken } from 'src/app/models/refresh-token';
import { ResendEmailConfirmation } from "../../models/resend-email-confirmation";
import { WindowService } from '../common/window.service';
import { TwoFactorToken } from 'src/app/models/two-factor-token';
import { CookieService } from 'ngx-cookie';
import { isPlatformBrowser } from '@angular/common';
import { RefreshTokenNotExistsError } from 'src/app/errors/refresh-token-not-exists-error';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        private httpClient: HttpClient,
        private windowService: WindowService,
        private cookieService: CookieService) {
            this.isBrowser = isPlatformBrowser(platformId);
    }

    public async refreshToken(): Promise<UserPayloadToken> {
        const refreshTokenDto = this.getRefreshToken();

        if (!this.isBrowser && !refreshTokenDto) {
            throw new RefreshTokenNotExistsError();
        }

        const event$ = this.httpClient.post<UserPayloadToken>(
            this.windowService.apiUrl() + '/api/v1/account/refresh-token', refreshTokenDto
        );

      return await firstValueFrom(event$);
    }

    public async login(login: Login, token: string): Promise<UserPayloadToken> {
        const event$ = this.httpClient.post<UserPayloadToken>(this.windowService.apiUrl() + '/api/v1/account/login', login, {
            headers: { 'X-Auth-2FA': token }
        });
        return await firstValueFrom(event$);
    }

    public async logout(): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/account/logout', null);
        await firstValueFrom(event$);
    }

    public async changePassword(changePassword: ChangePassword): Promise<object> {
        const event$ =  this.httpClient.put(this.windowService.apiUrl() + '/api/v1/account/password', changePassword);
        return await firstValueFrom(event$);
    }

    public async changeEmail(changeEmail: ChangeEmail): Promise<object> {
        const event$ =  this.httpClient.put(this.windowService.apiUrl() + '/api/v1/account/email', changeEmail);
        return await firstValueFrom(event$);
    }

    public async resend(resendEmailConfirmation: ResendEmailConfirmation): Promise<void> {
        const event$ =  this.httpClient.post(this.windowService.apiUrl() + '/api/v1/account/email/resend', resendEmailConfirmation);
        await firstValueFrom(event$);
    }

    public async getTwoFactorToken(): Promise<TwoFactorToken> {
        const event$ =  this.httpClient.get<TwoFactorToken>(this.windowService.apiUrl() + '/api/v1/account/get-2fa-token');
        return await firstValueFrom(event$);
    }

    public async enableTwoFactorToken(token: string): Promise<void> {
        const event$ =  this.httpClient.post(this.windowService.apiUrl() + '/api/v1/account/enable-2fa', null, {
            headers: { 'X-Auth-2FA': token }
        });

        await firstValueFrom(event$);
    }

    public async disableTwoFactorToken(token: string): Promise<void> {
        const event$ =  this.httpClient.post(this.windowService.apiUrl() + '/api/v1/account/disable-2fa', null, {
            headers: { 'X-Auth-2FA': token }
        });

        await firstValueFrom(event$);
    }

    private getRefreshToken(): RefreshToken | null {
        // In browser mode refresh token is send as a cookie (by browser).
        if (this.isBrowser) {
            return null;
        }
        
        // In Angular SSR mode we have to send refresh token from cookie (from user browser).
        const refreshToken = this.cookieService.get('refresh-token');
        if (!refreshToken) {
            return null;
        }

        return new RefreshToken(refreshToken, false);
    }
}
