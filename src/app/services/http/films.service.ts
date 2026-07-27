import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Film } from 'src/app/models/film';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class FilmsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number): Promise<PagedResult<Film>> {
        const event$ = this.httpClient.get<PagedResult<Film>>(this.windowService.apiUrl() + `/api/v1/films?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }
}
