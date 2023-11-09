import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Settings } from 'src/app/models/settings';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get(): Promise<Settings> {
        const event$ = this.httpClient.get<Settings>(this.windowService.apiUrl() + '/api/v1/settings');
        return await firstValueFrom(event$);
    }

    public async put(settings: Settings): Promise<Settings> {
        const event$ = this.httpClient.put<Settings>(this.windowService.apiUrl() + '/api/v1/settings', settings);
        return await firstValueFrom(event$);
    }
}
