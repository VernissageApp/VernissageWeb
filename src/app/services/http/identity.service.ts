import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccessToken } from 'src/app/models/access-token';
import { IdentityToken } from 'src/app/models/identity-token';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async login(identityToken: IdentityToken): Promise<AccessToken> {
        const event$ = this.httpClient.post<AccessToken>(this.windowService.apiUrl() + '/api/v1/identity/login', identityToken);
        return await firstValueFrom(event$);
    }
}
