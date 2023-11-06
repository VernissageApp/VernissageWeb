import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Status } from 'src/app/models/status';

@Injectable({
    providedIn: 'root'
})
export class TimelineService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async home(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<Status[]> {
        const event$ = this.httpClient.get<Status[]>(this.apiService +  `/api/v1/timelines/home?minId=${minId}&maxId=${maxId}&sinceId=${sinceId}&limit=${limit}`);
        return await firstValueFrom(event$);
    }

    public async public(minId?: string, maxId?: string, sinceId?: string, limit?: number, onlyLocal?: boolean): Promise<Status[]> {
        const event$ = this.httpClient.get<Status[]>(this.apiService +  `/api/v1/timelines/public?minId=${minId}&maxId=${maxId}&sinceId=${sinceId}&limit=${limit}&onlyLocal=${onlyLocal}`);
        return await firstValueFrom(event$);
    }
}
