import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthClient } from 'src/app/models/auth-client';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthClientsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async getList(): Promise<AuthClient[]> {
        const event$ = this.httpClient.get<AuthClient[]>(this.apiService + '/api/v1/auth-clients');
        return await firstValueFrom(event$);
    }
}
