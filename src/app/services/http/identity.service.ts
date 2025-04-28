import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserPayloadToken } from 'src/app/models/user-payload-token';
import { IdentityToken } from 'src/app/models/identity-token';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async login(identityToken: IdentityToken): Promise<UserPayloadToken> {
        const event$ = this.httpClient.post<UserPayloadToken>(this.windowService.apiUrl() + '/api/v1/identity/login', identityToken);
        return await firstValueFrom(event$);
    }
}
