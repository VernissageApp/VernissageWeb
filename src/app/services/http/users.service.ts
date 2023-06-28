import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user';

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

        const result = await firstValueFrom(event$);
        return result;
    }

    public async update(userName: string, user: User): Promise<User> {
        const event$ = this.httpClient.put<User>(this.usersService + '/api/v1/users/@' + userName, user);

        const result = await firstValueFrom(event$);
        return result;
    }

    public async delete(userName: string): Promise<object> {
        const event$ = this.httpClient.delete<User>(this.usersService + '/api/v1/users/@' + userName);

        const result = await firstValueFrom(event$);
        return result;
    }
}
