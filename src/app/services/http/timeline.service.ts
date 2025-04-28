import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';
import { User } from 'src/app/models/user';

@Injectable({
    providedIn: 'root'
})
export class TimelineService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async home(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/timelines/home?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async featuredStatuses(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/timelines/featured-statuses?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async featuredUsers(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<User>> {
        const event$ = this.httpClient.get<LinkableResult<User>>(this.windowService.apiUrl() +  `/api/v1/timelines/featured-users?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async public(minId?: string, maxId?: string, sinceId?: string, limit?: number, onlyLocal?: boolean): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/timelines/public?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}&onlyLocal=${onlyLocal ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async hashtag(hashtag: string, minId?: string, maxId?: string, sinceId?: string, limit?: number, onlyLocal?: boolean): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/timelines/hashtag/${hashtag}?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}&onlyLocal=${onlyLocal ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async category(category: string, minId?: string, maxId?: string, sinceId?: string, limit?: number, onlyLocal?: boolean): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/timelines/category/${category}?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}&onlyLocal=${onlyLocal ?? ''}`);
        return await firstValueFrom(event$);
    }
}
