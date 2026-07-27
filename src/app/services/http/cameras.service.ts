import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Camera } from 'src/app/models/camera';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class CamerasService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number): Promise<PagedResult<Camera>> {
        const event$ = this.httpClient.get<PagedResult<Camera>>(this.windowService.apiUrl() + `/api/v1/cameras?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }
}
