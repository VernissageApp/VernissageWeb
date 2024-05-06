import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PaginableResult } from 'src/app/models/paginable-result';
import { PushSubscription as PushSubscriptionDto } from 'src/app/models/push-subscription';

@Injectable({
    providedIn: 'root'
})
export class PushSubscriptionsService {

    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get(page: number, size: number): Promise<PaginableResult<PushSubscriptionDto>> {
        const event$ = this.httpClient.get<PaginableResult<PushSubscriptionDto>>(this.windowService.apiUrl() + `/api/v1/push-subscriptions?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async create(pushSubscription: PushSubscriptionDto): Promise<PushSubscriptionDto> {
        const event$ = this.httpClient.post<PushSubscriptionDto>(this.windowService.apiUrl() + '/api/v1/push-subscriptions', pushSubscription);
        return await firstValueFrom(event$);
    }

    public async update(id: string, pushSubscription: PushSubscriptionDto): Promise<PushSubscriptionDto> {
        const event$ = this.httpClient.put<PushSubscriptionDto>(this.windowService.apiUrl() + '/api/v1/push-subscriptions/' + id, pushSubscription);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/push-subscriptions/' + id);
        return await firstValueFrom(event$);
    }
}
