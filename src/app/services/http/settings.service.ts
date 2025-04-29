import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Settings } from 'src/app/models/settings';
import { WindowService } from '../common/window.service';
import { PublicSettings } from 'src/app/models/public-settings';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private _publicSettings?: PublicSettings;

    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public get publicSettings(): PublicSettings | undefined {
        return this._publicSettings;
    }

    public async load(): Promise<void> {
        this._publicSettings = await this.getPublic();
    }

    public async get(): Promise<Settings> {
        const event$ = this.httpClient.get<Settings>(this.windowService.apiUrl() + '/api/v1/settings');
        return await firstValueFrom(event$);
    }

    public async getPublic(): Promise<PublicSettings> {
        const event$ = this.httpClient.get<PublicSettings>(this.windowService.apiUrl() + '/api/v1/settings/public');
        return await firstValueFrom(event$);
    }

    public async put(settings: Settings): Promise<Settings> {
        const event$ = this.httpClient.put<Settings>(this.windowService.apiUrl() + '/api/v1/settings', settings);
        return await firstValueFrom(event$);
    }
}
