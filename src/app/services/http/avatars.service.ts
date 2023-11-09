import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class AvatarsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async uploadAvatar(userName: string, formData: FormData): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/avatars/@' + userName, formData);
        await firstValueFrom(event$);
    }

    public async deleteAvatar(userName: string): Promise<void> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/avatars/@' + userName);
        await firstValueFrom(event$);
    }
}
