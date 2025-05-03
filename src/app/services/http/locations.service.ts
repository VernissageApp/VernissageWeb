import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Location } from 'src/app/models/location';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class LocationsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async search(code: string, query?: string): Promise<Location[]> {
        if (!query || query === '') {
            return [];
        }

        const event$ = this.httpClient.get<Location[]>(this.windowService.apiUrl() +  `/api/v1/locations?code=${code}&query=${query}`);
        return await firstValueFrom(event$);
    }
}
