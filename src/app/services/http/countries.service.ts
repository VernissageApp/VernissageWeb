import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Country } from 'src/app/models/country';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class CountriesService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async all(): Promise<Country[]> {
        const event$ = this.httpClient.get<Country[]>(this.windowService.apiUrl() +  '/api/v1/countries');
        return await firstValueFrom(event$);
    }
}
