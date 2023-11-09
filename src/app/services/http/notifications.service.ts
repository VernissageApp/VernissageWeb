import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Notification } from 'src/app/models/notification';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get (minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<Notification[]> {
        const event$ = this.httpClient.get<Notification[]>(this.windowService.apiUrl() +  `/api/v1/notifications?minId=${minId}&maxId=${maxId}&sinceId=${sinceId}&limit=${limit}`);
        return await firstValueFrom(event$);
    }
}
