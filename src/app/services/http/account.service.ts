import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChangeEmail } from 'src/app/models/change-email';
import { AccessToken } from 'src/app/models/access-token';
import { Login } from 'src/app/models/login';
import { ChangePassword } from 'src/app/models/change-password';
import { RefreshToken } from 'src/app/models/refresh-token';
import { ResendEmailConfirmation } from "../../models/resend-email-confirmation";
import { WindowService } from '../common/window.service';
import { TwoFactorToken } from 'src/app/models/two-factor-token';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async refreshToken(refreshToken: string): Promise<AccessToken> {
        const event$ = this.httpClient.post<AccessToken>(
            this.windowService.apiUrl() + '/api/v1/account/refresh-token',
            new RefreshToken(refreshToken)
        );

      return await firstValueFrom(event$);
    }

    public async login(login: Login, token: string): Promise<AccessToken> {
        const event$ = this.httpClient.post<AccessToken>(this.windowService.apiUrl() + '/api/v1/account/login', login, {
            headers: { 'X-Auth-2FA': token }
        });
        return await firstValueFrom(event$);
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
}
