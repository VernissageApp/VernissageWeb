import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Location } from 'src/app/models/location';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LocationsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async search(code: string, query?: string): Promise<Location[]> {
        if (!query || query === '') {
            return [];
        }

        const event$ = this.httpClient.get<Location[]>(this.apiService +  `/api/v1/locations?code=${code}&query=${query}`);
        return await firstValueFrom(event$);
    }
}
