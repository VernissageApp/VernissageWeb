import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Health } from '../../models/health';

@Injectable({
    providedIn: 'root'
})
export class HealthService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(): Promise<Health> {
        const event$ = this.httpClient.get<Health>(this.windowService.apiUrl() + '/api/v1/health');
        return await firstValueFrom(event$);
    }
}
