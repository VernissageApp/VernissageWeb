import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Hashtag } from 'src/app/models/hashtag';
import { Status } from 'src/app/models/status';
import { AuthorizationService } from '../authorization/authorization.service';
import { HashtagsService } from '../http/hashtags.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class StatusHashtagsService {
    private followedHashtags: Hashtag[] = [];
    private hasFollowedHashtagsLoaded = false;
    private followedHashtagsLoadedForUserId?: string;
    private isBrowser = false;

    private platformId = inject(PLATFORM_ID);
    private hashtagsService = inject(HashtagsService);
    private authorizationService = inject(AuthorizationService);

    constructor() {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    public async ensureFollowedHashtagsLoaded(): Promise<void> {
        // For SSR we don't want to download additional data.
        if (!this.isBrowser) {
            return;
        }

        const userId = this.authorizationService.getUser()?.id;

        // Unauthorized user have empty followed tags array.
        if (!userId) {
            this.followedHashtags = [];
            this.hasFollowedHashtagsLoaded = false;
            this.followedHashtagsLoadedForUserId = undefined;

            return;
        }

        // Dor already downloaded followed tags array we don't need to do anything.
        if (this.hasFollowedHashtagsLoaded && this.followedHashtagsLoadedForUserId === userId) {
            return;
        }

        // First time we have to download followed tags.
        await this.refreshFollowedHashtags(userId);
    }

    public async reloadFollowedHashtags(): Promise<void> {
        // For SSR we don't want to download additional data.
        if (!this.isBrowser) {
            return;
        }

        const userId = this.authorizationService.getUser()?.id;

        // Unauthorized user have empty followed tags array.
        if (!userId) {
            this.followedHashtags = [];
            this.hasFollowedHashtagsLoaded = false;
            this.followedHashtagsLoadedForUserId = undefined;

            return;
        }

        // For reloading we need to execute this function always.
        await this.refreshFollowedHashtags(userId);
    }

    public getSharedFollowedHashtags(mainStatus: Status | undefined): string[] {
        // For SSR we will not render tags.
        if (!this.isBrowser) {
            return [];
        }

        const statusTags = mainStatus?.tags as Hashtag[] | undefined;
        if (!statusTags || statusTags.length === 0) {
            return [];
        }

        if (this.followedHashtags.length === 0) {
            return [];
        }

        const followedNormalizedHashtags = new Set(
            this.followedHashtags
                .map(item => this.normalizeHashtagName(item.name).toUpperCase())
                .filter(item => item.length > 0)
        );

        const uniqueHashtags = new Set<string>();
        const matchedHashtags: string[] = [];
        for (const item of statusTags) {
            const normalizedName = this.normalizeHashtagName(item.name);
            const normalizedKey = normalizedName.toUpperCase();

            if (normalizedKey.length > 0 && followedNormalizedHashtags.has(normalizedKey) && !uniqueHashtags.has(normalizedKey)) {
                uniqueHashtags.add(normalizedKey);
                matchedHashtags.push(normalizedName);
            }
        }

        return matchedHashtags;
    }

    public normalizeHashtagName(name: string): string {
        return name.replaceAll('#', '').trim().normalize('NFKC');
    }

    private async refreshFollowedHashtags(userId: string): Promise<void> {
        const downloadedHashtags = await this.hashtagsService.followed();

        this.followedHashtags = downloadedHashtags ?? [];
        this.hasFollowedHashtagsLoaded = true;
        this.followedHashtagsLoadedForUserId = userId;
    }
}
