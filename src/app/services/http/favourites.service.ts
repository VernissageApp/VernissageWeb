import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Status } from 'src/app/models/status';
import { WindowService } from '../common/window.service';
import { LinkableResult } from 'src/app/models/linkable-result';

@Injectable({
    providedIn: 'root'
})
export class FavouritesService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async list(minId?: string, maxId?: string, sinceId?: string, limit?: number): Promise<LinkableResult<Status>> {
        const event$ = this.httpClient.get<LinkableResult<Status>>(this.windowService.apiUrl() +  `/api/v1/favourites?minId=${minId ?? ''}&maxId=${maxId ?? ''}&sinceId=${sinceId ?? ''}&limit=${limit ?? ''}`);
        return await firstValueFrom(event$);
    }
}
