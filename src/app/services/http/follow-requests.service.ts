import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Relationship } from 'src/app/models/relationship';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class FollowRequestsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get(page: number, size: number): Promise<Relationship[]> {
        const event$ = this.httpClient.get<Relationship[]>(this.windowService.apiUrl() + `/api/v1/follow-requests?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async approve(userId: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.windowService.apiUrl() + `/api/v1/follow-requests/${userId}/approve`, null);
        return await firstValueFrom(event$);
    }

    public async reject(userId: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.windowService.apiUrl() + `/api/v1/follow-requests/${userId}/reject`, null);
        return await firstValueFrom(event$);
    }
}
