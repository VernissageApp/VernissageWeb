import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccessToken } from 'src/app/models/access-token';
import { Login } from 'src/app/models/login';
import { ChangePassword } from 'src/app/models/change-password';
import { RefreshToken } from 'src/app/models/refresh-token';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    private get usersService(): string {
        return environment.httpSchema + environment.usersService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async refreshToken(refreshToken: string): Promise<AccessToken> {
        const event$ = this.httpClient.post<AccessToken>(
            this.usersService + '/api/v1/account/refresh',
            new RefreshToken(refreshToken)
        );

        const result = await firstValueFrom(event$);
        return result;
    }

    public async login(login: Login): Promise<AccessToken> {
        const event$ = this.httpClient.post<AccessToken>(this.usersService + '/api/v1/account/login', login);

        const result = await firstValueFrom(event$);
        return result;
    }

    public async changePassword(changePassword: ChangePassword): Promise<object> {
        const event$ =  this.httpClient.post(this.usersService + '/api/v1/account/change-password', changePassword);

        const result = await firstValueFrom(event$);
        return result;
    }
}
