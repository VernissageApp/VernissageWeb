import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Location } from 'src/app/models/location';
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

    public async home(page: number, size: number): Promise<Status[]> {
        const event$ = this.httpClient.get<Status[]>(this.apiService +  `/api/v1/timelines/home?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }
}
