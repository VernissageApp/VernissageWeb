import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AttachmentsService {

    private get usersService(): string {
        return environment.httpSchema + environment.usersService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async uploadAttachment(formData: FormData): Promise<void> {
        const event$ = this.httpClient.post(this.usersService + '/api/v1/attachments', formData);
        await firstValueFrom(event$);
    }

    public async deleteAttachment(id: string): Promise<void> {
        const event$ = this.httpClient.delete(this.usersService + '/api/v1/attachments/' + id);
        await firstValueFrom(event$);
    }
}
