import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { UserAlias } from 'src/app/models/user-alias';

@Injectable({
    providedIn: 'root'
})
export class UserAliasesService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async get(): Promise<UserAlias[]> {
        const event$ = this.httpClient.get<UserAlias[]>(this.windowService.apiUrl() + '/api/v1/user-aliases');
        return await firstValueFrom(event$);
    }

    public async create(userAlias: UserAlias): Promise<UserAlias> {
        const event$ = this.httpClient.post<UserAlias>(this.windowService.apiUrl() + '/api/v1/user-aliases', userAlias);
        return await firstValueFrom(event$);
    }

    public async delete(id: string): Promise<object> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/user-aliases/' + id);
        return await firstValueFrom(event$);
    }
}
