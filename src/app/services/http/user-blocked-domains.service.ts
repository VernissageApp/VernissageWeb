import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { UserBlockedDomain } from 'src/app/models/user-blocked-domain';

@Injectable({
    providedIn: 'root'
})
export class UserBlockedDomainsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number, domain?: string): Promise<PagedResult<UserBlockedDomain>> {
        const query = domain ? `/api/v1/user-blocked-domains?domain=${domain}&page=${page}&size=${size}` : `/api/v1/user-blocked-domains?page=${page}&size=${size}`;
        const event$ = this.httpClient.get<PagedResult<UserBlockedDomain>>(this.windowService.apiUrl() + query);
        return await firstValueFrom(event$);
    }

    public async create(userBlockedDomain: UserBlockedDomain): Promise<UserBlockedDomain> {
        const event$ = this.httpClient.post<UserBlockedDomain>(this.windowService.apiUrl() + '/api/v1/user-blocked-domains', userBlockedDomain);
        return await firstValueFrom(event$);
    }

    public async update(id: string, userBlockedDomain: UserBlockedDomain): Promise<UserBlockedDomain> {
        const event$ = this.httpClient.put<UserBlockedDomain>(this.windowService.apiUrl() + '/api/v1/user-blocked-domains/' + id, userBlockedDomain);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/user-blocked-domains/' + id);
        return await firstValueFrom(event$);
    }
}
