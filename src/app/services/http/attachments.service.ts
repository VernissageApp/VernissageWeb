import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TemporaryAttachment } from 'src/app/models/temporary-attachment';

import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AttachmentsService {

    private get apiService(): string {
        return environment.httpSchema + environment.apiService;
    }

    constructor(private httpClient: HttpClient) {
    }

    public async uploadAttachment(formData: FormData): Promise<TemporaryAttachment> {
        const event$ = this.httpClient.post<TemporaryAttachment>(this.apiService + '/api/v1/attachments', formData);
        return await firstValueFrom(event$);
    }

    public async updateAttachment(temporaryAttachmentDto: TemporaryAttachment): Promise<void> {
        const event$ = this.httpClient.put(this.apiService + '/api/v1/attachments/' + temporaryAttachmentDto.id, temporaryAttachmentDto);
        await firstValueFrom(event$);
    }

    public async deleteAttachment(id: string): Promise<void> {
        const event$ = this.httpClient.delete(this.apiService + '/api/v1/attachments/' + id);
        await firstValueFrom(event$);
    }
}
