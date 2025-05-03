import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Relationship } from 'src/app/models/relationship';
import { WindowService } from '../common/window.service';

@Injectable({
    providedIn: 'root'
})
export class RelationshipsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(userId: string): Promise<Relationship> {
        const event$ = this.httpClient.get<Relationship[]>(this.windowService.apiUrl() + '/api/v1/relationships?id[]=' + userId);
        const relationships = await firstValueFrom(event$);

        return relationships.length === 1 ? relationships[0] : new Relationship();
    }

    public async getAll(userIds: string[]): Promise<Relationship[]> {
        const queryParams = userIds.join('&id[]=')
        const event$ = this.httpClient.get<Relationship[]>(this.windowService.apiUrl() + '/api/v1/relationships?id[]=' + queryParams);
        return await firstValueFrom(event$);
    }
}
