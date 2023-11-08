import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Settings } from 'src/app/models/settings';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async get(): Promise<Settings> {
        const event$ = this.httpClient.get<Settings>(this.apiService + '/api/v1/settings');
        return await firstValueFrom(event$);
    }

    public async put(settings: Settings): Promise<Settings> {
        const event$ = this.httpClient.put<Settings>(this.apiService + '/api/v1/settings', settings);
        return await firstValueFrom(event$);
    }
}
