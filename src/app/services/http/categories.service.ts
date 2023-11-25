import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Category } from 'src/app/models/category';

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async all(): Promise<Category[]> {
        const event$ = this.httpClient.get<Category[]>(this.windowService.apiUrl() +  '/api/v1/categories');
        return await firstValueFrom(event$);
    }
}
