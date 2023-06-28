import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccessToken } from 'src/app/models/access-token';
import { IdentityToken } from 'src/app/models/identity-token';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {

    private get usersService(): string {
        return environment.httpSchema + environment.usersService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async login(identityToken: IdentityToken): Promise<AccessToken> {
        const event$ = this.httpClient.post<AccessToken>(this.usersService + '/api/v1/identity/login', identityToken);

        const result = await firstValueFrom(event$);
        return result;
    }
}
