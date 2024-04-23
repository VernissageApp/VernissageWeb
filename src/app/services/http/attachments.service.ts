import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TemporaryAttachment } from 'src/app/models/temporary-attachment';
import { WindowService } from '../common/window.service';
import { AttachmentDescription } from 'src/app/models/attachment-description';

@Injectable({
    providedIn: 'root'
})
export class AttachmentsService {
    constructor(private httpClient: HttpClient, private windowService: WindowService) {
    }

    public async uploadAttachment(formData: FormData): Promise<TemporaryAttachment> {
        const event$ = this.httpClient.post<TemporaryAttachment>(this.windowService.apiUrl() + '/api/v1/attachments', formData);
        return await firstValueFrom(event$);
    }

    public async updateAttachment(temporaryAttachmentDto: TemporaryAttachment): Promise<void> {
        const event$ = this.httpClient.put(this.windowService.apiUrl() + '/api/v1/attachments/' + temporaryAttachmentDto.id, temporaryAttachmentDto);
        await firstValueFrom(event$);
    }

    public async deleteAttachment(id: string): Promise<void> {
        const event$ = this.httpClient.delete(this.windowService.apiUrl() + '/api/v1/attachments/' + id);
        await firstValueFrom(event$);
    }

    public async describe(id: string): Promise<AttachmentDescription> {
        const event$ = this.httpClient.get<AttachmentDescription>(this.windowService.apiUrl() + '/api/v1/attachments/' + id + '/describe');
        return await firstValueFrom(event$);
    }
}
