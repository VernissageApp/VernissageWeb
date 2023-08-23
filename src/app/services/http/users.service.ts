import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

import {environment} from 'src/environments/environment';
import {User} from 'src/app/models/user';
import { Relationship } from 'src/app/models/relationship';
import { Status } from 'src/app/models/status';

@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async profile(userName: string): Promise<User> {
        const event$ = this.httpClient.get<User>(this.apiService +  '/api/v1/users/' + userName);
        return await firstValueFrom(event$);
    }

    public async update(userName: string, user: User): Promise<User> {
        const event$ = this.httpClient.put<User>(this.apiService + '/api/v1/users/@' + userName, user);
        return await firstValueFrom(event$);
    }

    public async delete(userName: string): Promise<object> {
        const event$ = this.httpClient.delete<User>(this.apiService + '/api/v1/users/@' + userName);
        return await firstValueFrom(event$);
    }

    public async follow(userName: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.apiService + '/api/v1/users/@' + userName + '/follow', null);
        return await firstValueFrom(event$);
    }

    public async unfollow(userName: string): Promise<Relationship> {
        const event$ = this.httpClient.post<Relationship>(this.apiService + '/api/v1/users/@' + userName + '/unfollow', null);
        return await firstValueFrom(event$);
    }

    public async following(userName: string, page = 0, size = 100): Promise<User[]> {
        const event$ = this.httpClient.get<User[]>(this.apiService +  '/api/v1/users/' + userName + `/following?page=${page}&size${size}`);
        return await firstValueFrom(event$);
    }

    public async followers(userName: string, page = 0, size = 100): Promise<User[]> {
        const event$ = this.httpClient.get<User[]>(this.apiService +  '/api/v1/users/' + userName + `/followers?page=${page}&size${size}`);
        return await firstValueFrom(event$);
    }

    public async statuses(userName: string, page = 0, size = 100): Promise<Status[]> {
        const event$ = this.httpClient.get<Status[]>(this.apiService +  '/api/v1/users/' + userName + `/statuses?page=${page}&size${size}`);
        return await firstValueFrom(event$);
    }
}
