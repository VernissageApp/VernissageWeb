import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PagedResult } from 'src/app/models/paged-result';
import { HomeCard } from 'src/app/models/home-card';

@Injectable({
    providedIn: 'root'
})
export class HomeCardsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async cached(): Promise<HomeCard[]> {
        const event$ = this.httpClient.get<PagedResult<HomeCard>>(this.windowService.apiUrl() +  '/api/v1/home-cards/cached?page=1&size=100');
        const list = await firstValueFrom(event$);
        return list.data.sort((a, b)=> a.order - b.order) ?? [];
    }

    public async get(page: number, size: number): Promise<PagedResult<HomeCard>> {
        const event$ = this.httpClient.get<PagedResult<HomeCard>>(this.windowService.apiUrl() + `/api/v1/home-cards?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async create(homeCard: HomeCard): Promise<HomeCard> {
        const event$ = this.httpClient.post<HomeCard>(this.windowService.apiUrl() + '/api/v1/home-cards', homeCard);
        return await firstValueFrom(event$);
    }

    public async update(id: string, homeCard: HomeCard): Promise<HomeCard> {
        const event$ = this.httpClient.put<HomeCard>(this.windowService.apiUrl() + '/api/v1/home-cards/' + id, homeCard);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/home-cards/' + id);
        return await firstValueFrom(event$);
    }
}
