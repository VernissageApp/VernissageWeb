import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class ExportsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async following(): Promise<Blob> {
        const event$ = this.httpClient.get(this.windowService.apiUrl() +  '/api/v1/exports/following', { responseType: 'blob' });
        return await firstValueFrom(event$);
    }

    public async bookmarks(): Promise<Blob> {
        const event$ = this.httpClient.get(this.windowService.apiUrl() +  '/api/v1/exports/bookmarks', { responseType: 'blob' });
        return await firstValueFrom(event$);
    }
}
