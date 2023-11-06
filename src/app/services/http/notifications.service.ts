import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Notification } from 'src/app/models/notification';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async get (minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<Notification[]> {
        const event$ = this.httpClient.get<Notification[]>(this.apiService +  `/api/v1/notifications?minId=${minId}&maxId=${maxId}&sinceId=${sinceId}&limit=${limit}`);
        return await firstValueFrom(event$);
    }
}
