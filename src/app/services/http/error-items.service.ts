import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { ErrorItem } from 'src/app/models/error-item';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class ErrorItemsService {
    private lastErrorDate?: Date;
    private readonly offset = 5000;

    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number, query: string): Promise<PagedResult<ErrorItem>> {
        const event$ = this.httpClient.get<PagedResult<ErrorItem>>(this.windowService.apiUrl() + `/api/v1/error-items?page=${page}&size=${size}&query=${query ?? ''}`);
        return await firstValueFrom(event$);
    }

    public async post(error: ErrorItem): Promise<ErrorItem | undefined> {
        if (this.lastErrorDate) {
            const currentDate = new Date();
            const allowedDate = new Date(this.lastErrorDate.getTime() + this.offset);

            // We cannot send errors most often then on for 5 sec.
            if (currentDate < allowedDate) {
                return;
            }
        }

        this.lastErrorDate = new Date();
        const event$ = this.httpClient.post<ErrorItem>(this.windowService.apiUrl() + '/api/v1/error-items', error);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<void> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/error-items/' + id);
        await firstValueFrom(event$);
    }
}
