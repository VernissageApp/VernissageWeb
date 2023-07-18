import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Country } from 'src/app/models/country';

import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CountriesService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async all(): Promise<Country[]> {
        const event$ = this.httpClient.get<Country[]>(this.apiService +  '/api/v1/countries');
        return await firstValueFrom(event$);
    }
}
