import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { ReportRequest } from 'src/app/models/report-request';
import { Report } from 'src/app/models/report';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get(page: number, size: number): Promise<PagedResult<Report>> {
        const event$ = this.httpClient.get<PagedResult<Report>>(this.windowService.apiUrl() + `/api/v1/reports?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async create(reportRequest: ReportRequest): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/reports', reportRequest);
        await firstValueFrom(event$);
    }

    public async close(id: string): Promise<Report> {
        const event$ = this.httpClient.post<Report>(this.windowService.apiUrl() + `/api/v1/reports/${id}/close`, null);
        return await firstValueFrom(event$);
    }

    public async restore(id: string): Promise<Report> {
        const event$ = this.httpClient.post<Report>(this.windowService.apiUrl() + `/api/v1/reports/${id}/restore`, null);
        return await firstValueFrom(event$);
    }
}
