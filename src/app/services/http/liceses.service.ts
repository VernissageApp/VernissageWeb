import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { License } from 'src/app/models/license';

@Injectable({
    providedIn: 'root'
})
export class LicensesService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async all(): Promise<License[]> {
        const event$ = this.httpClient.get<License[]>(this.windowService.apiUrl() +  '/api/v1/licenses');
        return await firstValueFrom(event$);
    }
}
