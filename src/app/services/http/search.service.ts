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

    public async search(query: string, type: string): Promise<SearchResults> {
        const queryWithoutHashtags = query.replaceAll('#', '');
        const event$ = this.httpClient.get<SearchResults>(this.windowService.apiUrl() + '/api/v1/search?query=' + queryWithoutHashtags + '&type=' + type);
        return await firstValueFrom(event$);
    }
}
