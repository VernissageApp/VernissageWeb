import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Category } from 'src/app/models/category';
import { PagedResult } from 'src/app/models/paged-result';

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async all(onlyUsed = false): Promise<Category[]> {
        const event$ = this.httpClient.get<Category[]>(this.windowService.apiUrl() +  `/api/v1/categories/all?onlyUsed=${onlyUsed}`);
        return await firstValueFrom(event$);
    }

    public async get(page: number, size: number): Promise<PagedResult<Category>> {
        const event$ = this.httpClient.get<PagedResult<Category>>(this.windowService.apiUrl() + `/api/v1/categories?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async create(category: Category): Promise<Category> {
        const event$ = this.httpClient.post<Category>(this.windowService.apiUrl() + '/api/v1/categories', category);
        return await firstValueFrom(event$);
    }

    public async update(id: string, category: Category): Promise<Category> {
        const event$ = this.httpClient.put<Category>(this.windowService.apiUrl() + '/api/v1/categories/' + id, category);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/categories/' + id);
        return await firstValueFrom(event$);
    }

    public async enable(id: string): Promise<Category> {
        const event$ = this.httpClient.post<Category>(this.windowService.apiUrl() + '/api/v1/categories/' + id + '/enable', null);
        return await firstValueFrom(event$);
    }

    public async disable(id: string): Promise<Category> {
        const event$ = this.httpClient.post<Category>(this.windowService.apiUrl() + '/api/v1/categories/' + id + '/disable', null);
        return await firstValueFrom(event$);
    }
}
