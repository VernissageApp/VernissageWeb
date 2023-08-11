import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StatusRequest } from 'src/app/models/status-request';

import {environment} from 'src/environments/environment';
import { Relationship } from 'src/app/models/relationship';

@Injectable({
    providedIn: 'root'
})
export class RelationshipsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async get(userId: string): Promise<Relationship> {
        const event$ = this.httpClient.get<Relationship[]>(this.apiService + '/api/v1/relationships?id[]=' + userId);
        const relationships = await firstValueFrom(event$);

        return relationships.length === 1 ? relationships[0] : new Relationship();
    }
}
