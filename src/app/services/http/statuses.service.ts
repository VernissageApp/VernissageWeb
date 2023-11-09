import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { StatusRequest } from 'src/app/models/status-request';
import { ReblogRequest } from 'src/app/models/reblog-request';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class StatusesService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async create(statusRequest: StatusRequest): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.windowService.apiUrl() + '/api/v1/statuses', statusRequest);
        return await firstValueFrom(event$);
    }

    public async getAll(): Promise<Status[]> {
        const event$ = this.httpClient.get<Status[]>(this.windowService.apiUrl() + '/api/v1/statuses');
        return await firstValueFrom(event$);
    }

    public async get(id: string): Promise<Status> {
        const event$ = this.httpClient.get<Status>(this.windowService.apiUrl() + '/api/v1/statuses/' + id);
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
}
