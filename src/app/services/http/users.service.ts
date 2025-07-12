import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/app/models/user';
import { Relationship } from 'src/app/models/relationship';
import { Status } from 'src/app/models/status';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';
import { UserMuteRequest } from 'src/app/models/user-mute-request';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number, query: string, onlyLocal = false, sortColumn = 'createdAt', sortDirection = 'descending'): Promise<PagedResult<User>> {
        const event$ = this.httpClient.get<PagedResult<User>>(this.windowService.apiUrl() + `/api/v1/users?page=${page}&size=${size}&query=${query ?? ''}&onlyLocal=${onlyLocal}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`);
        return await firstValueFrom(event$);
    }

    public async profile(userNameOrId: string): Promise<User> {
        const event$ = this.httpClient.get<User>(this.windowService.apiUrl() +  '/api/v1/users/' + userNameOrId);
        return await firstValueFrom(event$);
    }

    public async update(userName: string, user: User): Promise<User> {
        const event$ = this.httpClient.put<User>(this.windowService.apiUrl() + '/api/v1/users/@' + userName, user);
        return await firstValueFrom(event$);
    }

    public async delete(userName: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/users/@' + userName);
        return await firstValueFrom(event$);
    }

    public async disableTwoFactorAuthentication(userName: string): Promise<object> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/disable-2fa', null);
        return await firstValueFrom(event$);
    }

    public async follow(userName: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/follow', null);
        return await firstValueFrom(event$);
    }

    public async unfollow(userName: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/unfollow', null);
        return await firstValueFrom(event$);
    }

    public async following(userName: string, minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<User>> {
        const event$ = this.httpClient.get<LinkableResult<User>>(this.windowService.apiUrl() +  '/api/v1/users/' + userName + `/following?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async followers(userName: string, minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<User>> {
        const event$ = this.httpClient.get<LinkableResult<User>>(this.windowService.apiUrl() +  '/api/v1/users/' + userName + `/followers?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async mute(userName: string, userMuteRequest: UserMuteRequest): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/mute', userMuteRequest);
        return await firstValueFrom(event$);
    }

    public async unmute(userName: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/unmute', null);
        return await firstValueFrom(event$);
    }

    public async feature(userName: string): Promise<User> {
        const event$ = this.httpClient.post<User>(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/feature', null);
        return await firstValueFrom(event$);
    }

    public async unfeature(userName: string): Promise<User> {
        const event$ = this.httpClient.post<User>(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/unfeature', null);
        return await firstValueFrom(event$);
    }

    public async enable(userName: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/enable', null);
        await firstValueFrom(event$);
    }

    public async disable(userName: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/disable', null);
        await firstValueFrom(event$);
    }

    public async connect(userName: string, code: string): Promise<void> {
        const event$ = this.httpClient.post<Report>(this.windowService.apiUrl() + `/api/v1/users/@${userName}/connect/${code}`, null);
        await firstValueFrom(event$);
    }

    public async disconnect(userName: string, code: string): Promise<void> {
        const event$ = this.httpClient.post<Report>(this.windowService.apiUrl() + `/api/v1/users/@${userName}/disconnect/${code}`, null);
        await firstValueFrom(event$);
    }

    public async approve(userName: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/approve', null);
        await firstValueFrom(event$);
    }

    public async reject(userName: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/reject', null);
        await firstValueFrom(event$);
    }

    public async refresh(userName: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/users/@' + userName + '/refresh', null);
        await firstValueFrom(event$);
    }

    public async statuses(userName: string, minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  '/api/v1/users/' + userName + `/statuses?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }
}
