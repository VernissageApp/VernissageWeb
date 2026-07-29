import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Lens } from 'src/app/models/lens';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class LensesService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(query = '', page: number, size: number): Promise<PagedResult<Lens>> {
        const event$ = this.httpClient.get<PagedResult<Lens>>(this.windowService.apiUrl() + `/api/v1/lenses?query=${query}&page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }
}
