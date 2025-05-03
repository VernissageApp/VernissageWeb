import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';

@Injectable({
    providedIn: 'root'
})
export class InstanceBlockedDomainsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number): Promise<PagedResult<InstanceBlockedDomain>> {
        const event$ = this.httpClient.get<PagedResult<InstanceBlockedDomain>>(this.windowService.apiUrl() + `/api/v1/instance-blocked-domains?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async create(instanceBlockedDomain: InstanceBlockedDomain): Promise<InstanceBlockedDomain> {
        const event$ = this.httpClient.post<InstanceBlockedDomain>(this.windowService.apiUrl() + '/api/v1/instance-blocked-domains', instanceBlockedDomain);
        return await firstValueFrom(event$);
    }

    public async update(id: string, instanceBlockedDomain: InstanceBlockedDomain): Promise<InstanceBlockedDomain> {
        const event$ = this.httpClient.put<InstanceBlockedDomain>(this.windowService.apiUrl() + '/api/v1/instance-blocked-domains/' + id, instanceBlockedDomain);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/instance-blocked-domains/' + id);
        return await firstValueFrom(event$);
    }
}
