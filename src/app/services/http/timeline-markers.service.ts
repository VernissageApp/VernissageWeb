import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { isPlatformBrowser } from '@angular/common';
import { TimelineMarker } from 'src/app/models/timeline-marker';
import { TimelineKind } from 'src/app/models/timeline-kind';

@Injectable({
    providedIn: 'root'
})
export class TimelineMarkersService {
    private isBrowser = false;

    private platformId = inject(PLATFORM_ID);
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    constructor() {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    public async get(timelineKind: TimelineKind): Promise<TimelineMarker> {
        const event$ = this.httpClient.get<TimelineMarker>(this.windowService.apiUrl() +  `/api/v1/timeline-markers/` + timelineKind);
        return await firstValueFrom(event$);
    }

    public async post(timelineKind: TimelineKind, statusId: string): Promise<void> {
        if (!this.isBrowser) {
            return;
        }

        const event$ = this.httpClient.post(this.windowService.apiUrl() +  `/api/v1/timeline-markers/${timelineKind}`, new TimelineMarker(statusId));
        await firstValueFrom(event$);
    }
}
