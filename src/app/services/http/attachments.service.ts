import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TemporaryAttachment } from 'src/app/models/temporary-attachment';
import { WindowService } from '../common/window.service';
import { AttachmentDescription } from 'src/app/models/attachment-description';
import { AttachmentHashtag } from 'src/app/models/attachment-hashtag';

@Injectable({
    providedIn: 'root'
})
export class AttachmentsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async uploadAttachment(formData: FormData): Promise<TemporaryAttachment> {
        const event$ = this.httpClient.post<TemporaryAttachment>(this.windowService.apiUrl() + '/api/v1/attachments', formData);
        return await firstValueFrom(event$);
    }

    public async uploadHdrImage(id: string, formData: FormData): Promise<TemporaryAttachment> {
        const event$ = this.httpClient.post<TemporaryAttachment>(this.windowService.apiUrl() + '/api/v1/attachments/' + id + '/hdr', formData);
        return await firstValueFrom(event$);
    }

    public async deleteHdrImage(id: string): Promise<TemporaryAttachment> {
        const event$ = this.httpClient.delete<TemporaryAttachment>(this.windowService.apiUrl() + '/api/v1/attachments/' + id + '/hdr');
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

    public async hashtags(id: string): Promise<AttachmentHashtag> {
        const event$ = this.httpClient.get<AttachmentHashtag>(this.windowService.apiUrl() + '/api/v1/attachments/' + id + '/hashtags');
        return await firstValueFrom(event$);
    }
}
