import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';

@Injectable({
    providedIn: 'root'
})
export class TimelineService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async home(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/timelines/home?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async featured(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/timelines/featured?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
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
