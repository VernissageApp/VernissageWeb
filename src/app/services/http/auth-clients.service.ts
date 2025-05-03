import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthClient } from 'src/app/models/auth-client';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class AuthClientsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async getList(): Promise<AuthClient[]> {
        const event$ = this.httpClient.get<AuthClient[]>(this.windowService.apiUrl() + '/api/v1/auth-clients');
        return await firstValueFrom(event$);
    }
}
