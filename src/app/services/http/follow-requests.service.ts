import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StatusRequest } from 'src/app/models/status-request';

import {environment} from 'src/environments/environment';
import { Relationship } from 'src/app/models/relationship';

@Injectable({
    providedIn: 'root'
})
export class FollowRequestsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async get(page: number, size: number): Promise<Relationship[]> {
        const event$ = this.httpClient.get<Relationship[]>(this.apiService + `/api/v1/follow-requests?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async approve(userId: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.apiService + `/api/v1/follow-requests/${userId}/approve`, null);
        return await firstValueFrom(event$);
    }

    public async reject(userId: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.apiService + `/api/v1/follow-requests/${userId}/reject`, null);
        return await firstValueFrom(event$);
    }
}
