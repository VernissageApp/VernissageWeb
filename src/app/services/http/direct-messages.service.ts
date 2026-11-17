import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DirectConversation } from '../../models/direct-conversation';
import { DirectMessage } from '../../models/direct-message';
import { DirectMessageRequest } from '../../models/direct-message-request';
import { PagedResult } from '../../models/paged-result';
import { WindowService } from '../common/window.service';

@Injectable({ providedIn: 'root' })
export class DirectMessagesService {
    private http = inject(HttpClient);
    private window = inject(WindowService);

    private get url(): string {
        return this.window.apiUrl() + '/api/v1/direct-messages';
    }

    list(page = 1, size = 40): Promise<PagedResult<DirectConversation>> {
        return firstValueFrom(this.http.get<PagedResult<DirectConversation>>(this.url, { params: { page, size } }));
    }

    conversation(id: string): Promise<DirectConversation> {
        return firstValueFrom(this.http.get<DirectConversation>(`${this.url}/${id}`));
    }

    messages(id: string, page = 1, size = 40): Promise<PagedResult<DirectMessage>> {
        return firstValueFrom(this.http.get<PagedResult<DirectMessage>>(`${this.url}/${id}/statuses`, { params: { page, size } }));
    }

    send(request: DirectMessageRequest, conversationId?: string): Promise<DirectMessage> {
        const url = conversationId ? `${this.url}/${conversationId}/statuses` : this.url;
        return firstValueFrom(this.http.post<DirectMessage>(url, request));
    }

    markRead(id: string, statusIds: string[]): Promise<unknown> {
        return firstValueFrom(this.http.post(`${this.url}/${id}/read`, { statusIds }));
    }

    mute(id: string, isMuted: boolean): Promise<unknown> {
        return firstValueFrom(this.http.put(`${this.url}/${id}/mute`, { isMuted }));
    }
}
