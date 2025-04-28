import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Invitation } from 'src/app/models/invitation';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class InvitationsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(): Promise<Invitation[]> {
        const event$ = this.httpClient.get<Invitation[]>(this.windowService.apiUrl() + '/api/v1/invitations');
        return await firstValueFrom(event$);
    }

    public async generate(): Promise<Invitation> {
        const event$ = this.httpClient.post<Invitation>(this.windowService.apiUrl() + '/api/v1/invitations/generate', null);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<void> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/invitations/' + id);
        await firstValueFrom(event$);
    }
}
