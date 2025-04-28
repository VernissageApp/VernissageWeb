import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { FollowingImport } from 'src/app/models/following-import';

@Injectable({
    providedIn: 'root'
})
export class FollowingImportsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number): Promise<PagedResult<FollowingImport>> {
        const event$ = this.httpClient.get<PagedResult<FollowingImport>>(this.windowService.apiUrl() + `/api/v1/following-imports?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async upload(formData: FormData): Promise<FollowingImport> {
        const event$ = this.httpClient.post<FollowingImport>(this.windowService.apiUrl() + '/api/v1/following-imports', formData);
        return await firstValueFrom(event$);
    }
}
