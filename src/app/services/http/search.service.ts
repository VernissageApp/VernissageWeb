import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SearchResults } from 'src/app/models/search-results';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async search(query: string, type: string, onlyCurrentUser = false): Promise<SearchResults> {
        const queryWithoutHashtags = query.replaceAll('#', '');
        const currentUserFilter = onlyCurrentUser ? '&onlyCurrentUser=true' : '';
        const event$ = this.httpClient.get<SearchResults>(this.windowService.apiUrl() + '/api/v1/search?query=' + queryWithoutHashtags + '&type=' + type + currentUserFilter);
        return await firstValueFrom(event$);
    }
}
