import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { ReportRequest } from 'src/app/models/report-request';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async create(reportRequest: ReportRequest): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/reports', reportRequest);
        await firstValueFrom(event$);
    }
}
