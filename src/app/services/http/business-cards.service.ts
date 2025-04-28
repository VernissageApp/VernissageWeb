import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { BusinessCard } from 'src/app/models/business-card';

@Injectable({
    providedIn: 'root'
})
export class BusinessCardsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async read(): Promise<BusinessCard> {
        const event$ = this.httpClient.get<BusinessCard>(this.windowService.apiUrl() + '/api/v1/business-cards');
        return await firstValueFrom(event$);
    }

    public async create(businessCard: BusinessCard): Promise<BusinessCard> {
        const event$ = this.httpClient.post<BusinessCard>(this.windowService.apiUrl() + '/api/v1/business-cards', businessCard);
        return await firstValueFrom(event$);
    }

    public async update(businessCard: BusinessCard): Promise<BusinessCard> {
        const event$ = this.httpClient.put<BusinessCard>(this.windowService.apiUrl() + '/api/v1/business-cards/', businessCard);
        return await firstValueFrom(event$);
    }

    public async businessCardExists(): Promise<boolean> {
        try {
            const event$ = this.httpClient.get<BusinessCard>(this.windowService.apiUrl() + '/api/v1/business-cards');
            await firstValueFrom(event$);

            return true;
        } catch {
            return false;
        }
    }
}
