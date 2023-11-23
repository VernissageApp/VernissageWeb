import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';
import { TrendingPeriod } from 'src/app/models/trending-period';

@Injectable({
    providedIn: 'root'
})
export class TrendingService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async statuses(minId?: string, maxId?: string, sinceId?: string, limit?: number, period?: TrendingPeriod): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/trending/statuses?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}&period=${period}`);
        return await firstValueFrom(event$);
    }
}
