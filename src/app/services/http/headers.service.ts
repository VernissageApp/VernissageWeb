import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class HeadersService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async uploadHeader(userName: string, formData: FormData): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/headers/@' + userName, formData);
        await firstValueFrom(event$);
    }

    public async deleteHeader(userName: string): Promise<void> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/headers/@' + userName);
        await firstValueFrom(event$);
    }
}
