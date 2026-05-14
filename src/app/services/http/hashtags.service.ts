import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '../common/window.service';
import { Hashtag } from 'src/app/models/hashtag';

@Injectable({
    providedIn: 'root'
})
export class HashtagsService {
    private httpClient = inject(HttpClient);
    private windowService = inject(WindowService);

    public async followed(): Promise<Hashtag[]> {
        const event$ = this.httpClient.get<Hashtag[]>(this.windowService.apiUrl() + '/api/v1/hashtags/followed');
        const followedHashtags = await firstValueFrom(event$, { defaultValue: [] as Hashtag[] });
        return followedHashtags ?? [];
    }

    public async follow(name: string): Promise<void> {
        const normalizedHashtagName = encodeURIComponent(this.normalizeHashtagName(name));
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/hashtags/' + normalizedHashtagName + '/follow', null);
        await firstValueFrom(event$);
    }

    public async unfollow(name: string): Promise<void> {
        const normalizedHashtagName = encodeURIComponent(this.normalizeHashtagName(name));
        const event$ = this.httpClient.post(this.windowService.apiUrl() + '/api/v1/hashtags/' + normalizedHashtagName + '/unfollow', null);
        await firstValueFrom(event$);
    }

    private normalizeHashtagName(name: string): string {
        return name.replaceAll('#', '').trim();
    }
}
