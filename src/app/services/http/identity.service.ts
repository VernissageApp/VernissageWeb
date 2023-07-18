import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccessToken } from 'src/app/models/access-token';
import { IdentityToken } from 'src/app/models/identity-token';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async login(identityToken: IdentityToken): Promise<AccessToken> {
        const event$ = this.httpClient.post<AccessToken>(this.apiService + '/api/v1/identity/login', identityToken);
        return await firstValueFrom(event$);
    }
}
