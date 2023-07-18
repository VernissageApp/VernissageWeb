import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { StatusRequest } from 'src/app/models/status-request';

import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StatusesService {

    private get usersService(): string {
        return environment.httpSchema + environment.usersService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async create(statusRequest: StatusRequest): Promise<Status> {
        const event$ = this.httpClient.post<Status>(this.usersService + '/api/v1/statuses', statusRequest);
        return await firstValueFrom(event$);
    }
}
