import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Archive } from 'src/app/models/archive';

@Injectable({
    providedIn: 'root'
})
export class ArchivesService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get(): Promise<Archive[]> {
        const event$ = this.httpClient.get<Archive[]>(this.windowService.apiUrl() + '/api/v1/archives');
        return await firstValueFrom(event$);
    }

    public async create(): Promise<Archive> {
        const event$ = this.httpClient.post<Archive>(this.windowService.apiUrl() + '/api/v1/archives', null);
        return await firstValueFrom(event$);
    }
}
