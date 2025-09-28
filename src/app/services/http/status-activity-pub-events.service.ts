import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { StatusActivityPubEvent } from 'src/app/models/status-activity-pub-event';
import { StatusActivityPubEventItem } from 'src/app/models/status-activity-pub-event-item';

@Injectable({
    providedIn: 'root'
})
export class StatusActivityPubEventsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async events(page: number, size: number, type?: string, result?: string, sortColumn = 'createdAt', sortDirection = 'descending'): Promise<PagedResult<StatusActivityPubEvent>> {
        const event$ = this.httpClient.get<PagedResult<StatusActivityPubEvent>>(this.windowService.apiUrl() + `/api/v1/status-activity-pub-events?page=${page}&size=${size}&type=${type ?? ''}&result=${result ?? ''}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`);
        return await firstValueFrom(event$);
    }

    public async eventItems(eventId: string, page: number, size: number, onlyErrors?: boolean, sortColumn = 'createdAt', sortDirection = 'descending'): Promise<PagedResult<StatusActivityPubEventItem>> {
        const event$ = this.httpClient.get<PagedResult<StatusActivityPubEventItem>>(this.windowService.apiUrl() + `/api/v1/status-activity-pub-events/${eventId}/items?page=${page}&size=${size}&onlyErrors=${onlyErrors}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`);
        return await firstValueFrom(event$);
    }
}
