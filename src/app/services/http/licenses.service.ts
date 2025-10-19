import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { License } from 'src/app/models/license';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class LicensesService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async all(): Promise<License[]> {
        const event$ = this.httpClient.get<PagedResult<License>>(this.windowService.apiUrl() +  '/api/v1/licenses?page=1&size=100');
        const list = await firstValueFrom(event$);
        return list.data ?? [];
    }

    public async get(page: number, size: number): Promise<PagedResult<License>> {
        const event$ = this.httpClient.get<PagedResult<License>>(this.windowService.apiUrl() + `/api/v1/licenses?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async create(license: License): Promise<License> {
        const event$ = this.httpClient.post<License>(this.windowService.apiUrl() + '/api/v1/licenses', license);
        return await firstValueFrom(event$);
    }

    public async update(id: string, license: License): Promise<License> {
        const event$ = this.httpClient.put<License>(this.windowService.apiUrl() + '/api/v1/licenses/' + id, license);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/licenses/' + id);
        return await firstValueFrom(event$);
    }
}
