import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { UserSetting } from 'src/app/models/user-setting';

@Injectable({
    providedIn: 'root'
})
export class UserSettingsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get(): Promise<UserSetting[]> {
        const event$ = this.httpClient.get<UserSetting[]>(this.windowService.apiUrl() + '/api/v1/user-settings');
        return await firstValueFrom(event$);
    }

    public async read(key: string): Promise<UserSetting | undefined> {
        try {
            const event$ = this.httpClient.get<UserSetting>(this.windowService.apiUrl() + '/api/v1/user-settings/' + key);
            return await firstValueFrom(event$);
        } catch {
            return undefined;
        }
    }

    public async set(userSetting: UserSetting): Promise<UserSetting> {
        const event$ = this.httpClient.put<UserSetting>(this.windowService.apiUrl() + '/api/v1/user-settings', userSetting);
        return await firstValueFrom(event$);
    }

    public async delete(key: string): Promise<void> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/user-settings/' + key);
        await firstValueFrom(event$);
    }
}
