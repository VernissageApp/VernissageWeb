import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SearchResults } from 'src/app/models/search-results';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async search(query: string): Promise<SearchResults> {
        const event$ = this.httpClient.get<SearchResults>(this.windowService.apiUrl() + '/api/v1/search?query=' + query);
        return await firstValueFrom(event$);
    }
}
