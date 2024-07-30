import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { PaginableResult } from 'src/app/models/paginable-result';
import { Rule } from 'src/app/models/rule';

@Injectable({
    providedIn: 'root'
})
export class RulesService {

    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async get(page: number, size: number): Promise<PaginableResult<Rule>> {
        const event$ = this.httpClient.get<PaginableResult<Rule>>(this.windowService.apiUrl() + `/api/v1/rules?page=${page}&size=${size}`);
        return await firstValueFrom(event$);
    }

    public async create(rule: Rule): Promise<Rule> {
        const event$ = this.httpClient.post<Rule>(this.windowService.apiUrl() + '/api/v1/rules', rule);
        return await firstValueFrom(event$);
    }

    public async update(id: string, rule: Rule): Promise<Rule> {
        const event$ = this.httpClient.put<Rule>(this.windowService.apiUrl() + '/api/v1/rules/' + id, rule);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/rules/' + id);
        return await firstValueFrom(event$);
    }
}
