import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {environment} from 'src/environments/environment';
import {User} from 'src/app/models/user';

@Injectable({
    providedIn: 'root'
})
export class AvatarsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async uploadAvatar(userName: string, formData: FormData): Promise<void> {
        const event$ = this.httpClient.post(this.apiService + '/api/v1/avatars/@' + userName, formData);
        await firstValueFrom(event$);
    }

    public async deleteAvatar(userName: string): Promise<void> {
        const event$ = this.httpClient.delete(this.apiService + '/api/v1/avatars/@' + userName);
        await firstValueFrom(event$);
    }
}