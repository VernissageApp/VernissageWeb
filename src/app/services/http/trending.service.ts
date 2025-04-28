import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';
import { TrendingPeriod } from 'src/app/models/trending-period';
import { User } from 'src/app/models/user';
import { Hashtag } from 'src/app/models/hashtag';

@Injectable({
    providedIn: 'root'
})
export class TrendingService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async statuses(minId?: string, maxId?: string, sinceId?: string, limit?: number, period?: TrendingPeriod): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/trending/statuses?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}&period=${period}`);
        return await firstValueFrom(event$);
    }

    public async users(minId?: string, maxId?: string, sinceId?: string, limit?: number, period?: TrendingPeriod): Promise<LinkableResult<User>> {
        const event$ = this.httpClient.get<LinkableResult<User>>(this.windowService.apiUrl() +  `/api/v1/trending/users?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}&period=${period}`);
        return await firstValueFrom(event$);
    }

    public async hashtags(minId?: string, maxId?: string, sinceId?: string, limit?: number, period?: TrendingPeriod): Promise<LinkableResult<Hashtag>> {
        const event$ = this.httpClient.get<LinkableResult<Hashtag>>(this.windowService.apiUrl() +  `/api/v1/trending/hashtags?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}&period=${period}`);
        return await firstValueFrom(event$);
    }
}
