import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';
import { SharedBusinessCardMessage } from 'src/app/models/shared-business-card-message';
import { SharedBusinessCardUpdateRequest } from 'src/app/models/shared-business-card-update-request';

@Injectable({
    providedIn: 'root'
})
export class SharedBusinessCardsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(page: number, size: number): Promise<PagedResult<SharedBusinessCard>> {
        const event$ = this.httpClient.get<PagedResult<SharedBusinessCard>>(this.windowService.apiUrl() + `/api/v1/shared-business-cards?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async read(id: string): Promise<SharedBusinessCard> {
        const event$ = this.httpClient.get<SharedBusinessCard>(this.windowService.apiUrl() + `/api/v1/shared-business-cards/${id}`);
        return await firstValueFrom(event$);
    }

    public async create(sharedBusinessCard: SharedBusinessCard): Promise<SharedBusinessCard> {
        const event$ = this.httpClient.post<SharedBusinessCard>(this.windowService.apiUrl() + '/api/v1/shared-business-cards', sharedBusinessCard);
        return await firstValueFrom(event$);
    }

    public async update(id: string, sharedBusinessCard: SharedBusinessCard): Promise<SharedBusinessCard> {
        const event$ = this.httpClient.put<SharedBusinessCard>(this.windowService.apiUrl() + '/api/v1/shared-business-cards/' + id, sharedBusinessCard);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/shared-business-cards/' + id);
        return await firstValueFrom(event$);
    }

    public async message(id: string, sharedBusinessCardMessage: SharedBusinessCardMessage): Promise<object> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + `/api/v1/shared-business-cards/${id}/message`, sharedBusinessCardMessage);
        return await firstValueFrom(event$);
    }

    public async revoke(id: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + `/api/v1/shared-business-cards/${id}/revoke`, null);
        await firstValueFrom(event$);
    }

    public async unrevoke(id: string): Promise<void> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + `/api/v1/shared-business-cards/${id}/unrevoke`, null);
        await firstValueFrom(event$);
    }

    public async getByThirdParty(code: string): Promise<SharedBusinessCard> {
        const event$ = this.httpClient.get<SharedBusinessCard>(this.windowService.apiUrl() + `/api/v1/shared-business-cards/${code}/third-party`);
        return await firstValueFrom(event$);
    }

    public async updateByThirdParty(code: string, sharedBusinessCardUpdateRequest: SharedBusinessCardUpdateRequest): Promise<object> {
        const event$ = this.httpClient.put(this.windowService.apiUrl() + `/api/v1/shared-business-cards/${code}/third-party`, sharedBusinessCardUpdateRequest);
        return await firstValueFrom(event$);
    }

    public async messageByThirdParty(code: string, sharedBusinessCardMessage: SharedBusinessCardMessage): Promise<object> {
        const event$ = this.httpClient.post(this.windowService.apiUrl() + `/api/v1/shared-business-cards/${code}/third-party/message`, sharedBusinessCardMessage);
        return await firstValueFrom(event$);
    }
}
