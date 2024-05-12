import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Notification } from 'src/app/models/notification';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';
import { NotificationsCountDto } from 'src/app/models/notifications-count';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    public changes = new BehaviorSubject<number>(0);

    constructor(
        private httpClient: HttpClient,
        private windowService: WindowService) {
    }

    public async get(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Notification>> {
        const event$ = this.httpClient.get<LinkableResult<Notification>>(this.windowService.apiUrl() +  `/api/v1/notifications?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async count(): Promise<NotificationsCountDto> {
        const event$ = this.httpClient.get<NotificationsCountDto>(this.windowService.apiUrl() +  `/api/v1/notifications/count`);
        return await firstValueFrom(event$);
    }

    public async marker(notificationId: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() +  `/api/v1/notifications/marker/${notificationId}`, null);
        await firstValueFrom(event$);
    }

    public isPushApiSupported(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    }

    public isApplicationBadgeSupported(): boolean {
        return 'setAppBadge' in navigator;
    }
}
