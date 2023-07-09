import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

import {environment} from 'src/environments/environment';
import {User} from 'src/app/models/user';

@Injectable({
    providedIn: 'root'
})
export class HeadersService {

    private get usersService(): string {
        return environment.httpSchema + environment.usersService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async uploadHeader(userName: string, formData: FormData): Promise<void> {
        const event$ = this.httpClient.post(this.usersService + '/api/v1/headers/@' + userName, formData);
        await firstValueFrom(event$);
    }

    public async deleteHeader(userName: string): Promise<void> {
        const event$ = this.httpClient.delete(this.usersService + '/api/v1/headers/@' + userName);
        await firstValueFrom(event$);
    }
}
