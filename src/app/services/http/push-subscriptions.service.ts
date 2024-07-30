import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PaginableResult } from 'src/app/models/paginable-result';
import { PushSubscription as PushSubscriptionDto } from 'src/app/models/push-subscription';
import { SettingsService } from './settings.service';
import { SwPush } from '@angular/service-worker';

@Injectable({
    providedIn: 'root'
})
export class PushSubscriptionsService {

    constructor(
        private httpClient: HttpClient,
        private windowService: WindowService,
        private settingsService: SettingsService,
        private swPushService: SwPush) {
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

    public async getPushSubscription(endpoint: string | undefined): Promise<PushSubscriptionDto | null> {
        if (!endpoint) {
            return null;
        }

        const pushSubscriptions = await this.get(1, 100);
        const result = pushSubscriptions.data.filter(x => x.endpoint === endpoint);
        if (result.length > 0) {
            return result[0];
        }

        return null;
    }

    public async updatePushSubscription(): Promise<void> {
        if (!this.settingsService.publicSettings?.webPushVapidPublicKey) {
            return;
        }

        try {
            if (!this.swPushService.isEnabled) {
                console.info("Notification is not enabled.");
                return;
            }

            const subscription = await firstValueFrom(this.swPushService.subscription);
            if (subscription) {
                const jsonObject = subscription.toJSON();
                const endpoint = jsonObject.endpoint;
                const p256dh = jsonObject.keys?.p256dh;
                const auth = jsonObject.keys?.auth;

                if (!endpoint || !p256dh || !auth) {
                    return;
                }

                const existsInDatabase = await this.existsInDatabase(endpoint);
                if (!existsInDatabase) {
                    const pusSubscription = new PushSubscriptionDto();
                    pusSubscription.endpoint = endpoint;
                    pusSubscription.userAgentPublicKey = p256dh;
                    pusSubscription.auth = auth;
                
                    await this.create(pusSubscription);
                }
            }
        } catch (error) {
            console.error('Could not update subscription:', error);
        }
    }

    private async existsInDatabase(endpoint: string): Promise<boolean> {
        const pushSubscriptions = await this.get(1, 100);
        const result = pushSubscriptions.data.filter(x => x.endpoint === endpoint);
        if (result.length > 0) {
            return true;
        }

        return false;
    }
}
