import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StatusRequest } from 'src/app/models/status-request';

import {environment} from 'src/environments/environment';
import { Relationship } from 'src/app/models/relationship';
import { SearchResults } from 'src/app/models/search-results';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async search(query: string): Promise<SearchResults> {
        const event$ = this.httpClient.get<SearchResults>(this.apiService + '/api/v1/search?query=' + query);
        return await firstValueFrom(event$);
    }
}
