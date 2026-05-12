import { inject, Injectable, signal } from '@angular/core';
import { Hashtag } from 'src/app/models/hashtag';
import { Status } from 'src/app/models/status';
import { UserPayload } from 'src/app/models/user-payload';
import { AuthorizationService } from '../authorization/authorization.service';
import { HashtagsService } from '../http/hashtags.service';

@Injectable({
    providedIn: 'root'
})
export class StatusHashtagsService {
    private followedHashtags = signal<Hashtag[]>([]);
    private hasFollowedHashtagsLoaded = false;
    private followedHashtagsRefreshPromise?: Promise<Hashtag[]>;
    private isInitialized = false;

    private hashtagsService = inject(HashtagsService);
    private authorizationService = inject(AuthorizationService);

    public initialize(): void {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;
        this.authorizationService.changes.subscribe((userPayload) => {
            void this.onAuthorizationChange(userPayload);
        });

        void this.onAuthorizationChange(this.authorizationService.getUser());
    }

    public async ensureFollowedHashtagsLoaded(): Promise<void> {
        if (!this.hasFollowedHashtagsLoaded && this.authorizationService.getUser()) {
            await this.refreshFollowedHashtags();
        }
    }

    public followedFromCache(): Hashtag[] {
        return this.followedHashtags();
    }

    public isFollowed(name: string): boolean {
        const normalizedHashtagName = this.normalizeHashtagName(name).toUpperCase();
        if (!normalizedHashtagName) {
            return false;
        }

        return this.followedHashtags().some(item => this.normalizeHashtagName(item.name).toUpperCase() === normalizedHashtagName);
    }

    public getSharedFollowedHashtags(mainStatus: Status | undefined): string[] {
        const statusTags = mainStatus?.tags as Hashtag[] | undefined;
        if (!statusTags || statusTags.length === 0) {
            return [];
        }

        const followedHashtags = this.followedHashtags();
        if (followedHashtags.length === 0) {
            return [];
        }

        const followedNormalizedHashtags = new Set(
            followedHashtags
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

    private async onAuthorizationChange(userPayload: UserPayload | undefined): Promise<void> {
        if (!userPayload) {
            this.followedHashtags.set([]);
            this.hasFollowedHashtagsLoaded = false;
            return;
        }

        try {
            await this.refreshFollowedHashtags();
        } catch (error) {
            console.error(error);
        }
    }

    public async refreshFollowedHashtags(): Promise<Hashtag[]> {
        if (!this.authorizationService.getUser()) {
            this.followedHashtags.set([]);
            this.hasFollowedHashtagsLoaded = false;
            return [];
        }

        if (this.followedHashtagsRefreshPromise) {
            return await this.followedHashtagsRefreshPromise;
        }

        this.followedHashtagsRefreshPromise = this.hashtagsService.followed();
        try {
            const downloadedHashtags = await this.followedHashtagsRefreshPromise;
            this.followedHashtags.set(downloadedHashtags ?? []);
            this.hasFollowedHashtagsLoaded = true;
            return this.followedHashtags();
        } finally {
            this.followedHashtagsRefreshPromise = undefined;
        }
    }
}
