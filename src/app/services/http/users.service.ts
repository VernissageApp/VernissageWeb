import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

import {environment} from 'src/environments/environment';
import {User} from 'src/app/models/user';

@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private get usersService(): string {
        return environment.httpSchema + environment.usersService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async profile(userName: string): Promise<User> {
        const event$ = this.httpClient.get<User>(this.usersService +  '/api/v1/users/' + userName);
        return await firstValueFrom(event$);
    }

    public async update(userName: string, user: User): Promise<User> {
        const event$ = this.httpClient.put<User>(this.usersService + '/api/v1/users/@' + userName, user);
        return await firstValueFrom(event$);
    }

    public async uploadAvatar(userName: string, formData: FormData): Promise<void> {
        const event$ = this.httpClient.post(this.usersService + '/api/v1/users/@' + userName + "/avatar", formData);
        await firstValueFrom(event$);
    }

    public async deleteAvatar(userName: string): Promise<void> {
        const event$ = this.httpClient.delete(this.usersService + '/api/v1/users/@' + userName + "/avatar");
        await firstValueFrom(event$);
    }

    public async uploadHeader(userName: string, formData: FormData): Promise<void> {
        const event$ = this.httpClient.post(this.usersService + '/api/v1/users/@' + userName + "/header", formData);
        await firstValueFrom(event$);
    }

    public async deleteHeader(userName: string): Promise<void> {
        const event$ = this.httpClient.delete(this.usersService + '/api/v1/users/@' + userName + "/header");
        await firstValueFrom(event$);
    }

    public async delete(userName: string): Promise<object> {
        const event$ = this.httpClient.delete<User>(this.usersService + '/api/v1/users/@' + userName);
        return await firstValueFrom(event$);
    }
}
