import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { StatusRequest } from 'src/app/models/status-request';
import { ReblogRequest } from 'src/app/models/reblog-request';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';
import { StatusContext } from 'src/app/models/status-context';
import { User } from 'src/app/models/user';
import { ContentWarning } from 'src/app/models/content-warning';
import { PagedResult } from 'src/app/models/paged-result';
import { StatusActivityPubEvent } from 'src/app/models/status-activity-pub-event';
import { StatusActivityPubEventItem } from 'src/app/models/status-activity-pub-event-item';

@Injectable({
    providedIn: 'root'
})
export class StatusesService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async create(statusRequest: StatusRequest): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses', statusRequest);
        return await firstValueFrom(event$);
    }

    public async update(statusRequest: StatusRequest): Promise<Status> {
        const event$ = this.httpClient.put<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + statusRequest.id, statusRequest);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<void> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/statuses/' + id);
        await firstValueFrom(event$);
    }

    public async unlist(id: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/unlist', null);
        await firstValueFrom(event$);
    }

    public async applyContentWarning(id: string, contentWarning: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/apply-content-warning', new ContentWarning(contentWarning));
        await firstValueFrom(event$);
    }

    public async getAll(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() + `/api/v1/statuses?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async get(id: string): Promise<Status> {
        const event$ = this.httpClient.get<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id);
        return await firstValueFrom(event$);
    }

    public async getHistories(id: string): Promise<Status[]> {
        const event$ = this.httpClient.get<Status[]>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/history');
        return await firstValueFrom(event$);
    }

    public async reblog(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/reblog', new ReblogRequest(StatusVisibility.Public));
        return await firstValueFrom(event$);
    }

    public async unreblog(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/unreblog', null);
        return await firstValueFrom(event$);
    }

    public async favourite(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/favourite', null);
        return await firstValueFrom(event$);
    }

    public async unfavourite(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/unfavourite', null);
        return await firstValueFrom(event$);
    }

    public async bookmark(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/bookmark', null);
        return await firstValueFrom(event$);
    }

    public async unbookmark(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/unbookmark', null);
        return await firstValueFrom(event$);
    }

    public async feature(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/feature', null);
        return await firstValueFrom(event$);
    }

    public async unfeature(id: string): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/unfeature', null);
        return await firstValueFrom(event$);
    }

    public async context(id: string): Promise<StatusContext> {
        const event$ = this.httpClient.get<StatusContext>(this.windowService.apiUrl() + '/api/v1/statuses/' + id + '/context');
        return await firstValueFrom(event$);
    }

    public async reblgged(statusId: string, minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<User>> {
        const event$ = this.httpClient.get<LinkableResult<User>>(this.windowService.apiUrl() +  '/api/v1/statuses/' + statusId + `/reblogged?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async favourited(statusId: string, minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<User>> {
        const event$ = this.httpClient.get<LinkableResult<User>>(this.windowService.apiUrl() +  '/api/v1/statuses/' + statusId + `/favourited?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async events(statusId: string, page: number, size: number, type?: string, result?: string, sortColumn = 'createdAt', sortDirection = 'descending'): Promise<PagedResult<StatusActivityPubEvent>> {
        const event$ = this.httpClient.get<PagedResult<StatusActivityPubEvent>>(this.windowService.apiUrl() + `/api/v1/statuses/${statusId}/events?page=${page}&size=${size}&type=${type ?? ''}&result=${result ?? ''}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`);
        return await firstValueFrom(event$);
    }

    public async eventItems(statusId: string, eventId: string, page: number, size: number, onlyErrors?: boolean, sortColumn = 'createdAt', sortDirection = 'descending'): Promise<PagedResult<StatusActivityPubEventItem>> {
        const event$ = this.httpClient.get<PagedResult<StatusActivityPubEventItem>>(this.windowService.apiUrl() + `/api/v1/statuses/${statusId}/events/${eventId}/items?page=${page}&size=${size}&onlyErrors=${onlyErrors}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`);
        return await firstValueFrom(event$);
    }
}
