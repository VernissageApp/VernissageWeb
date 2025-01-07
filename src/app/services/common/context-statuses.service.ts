import { Injectable } from '@angular/core';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { PersistanceService } from '../persistance/persistance.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { TimelineService } from '../http/timeline.service';
import { TrendingService } from '../http/trending.service';
import { TrendingPeriod } from 'src/app/models/trending-period';
import { UsersService } from '../http/users.service';
import { BookmarksService } from '../http/bookmarks.service';
import { FavouritesService } from '../http/favourites.service';

@Injectable({
    providedIn: 'root'
})
export class ContextStatusesService {
    private statuses?: LinkableResult<Status>;
    public allOlderStatusesDownloaded = false;
    public allNewerStatusesDownloaded = false;

    constructor(
        private persistanceService: PersistanceService,
        private timelineService: TimelineService,
        private bookmarksService: BookmarksService,
        private favouritesService: FavouritesService,
        private usersService: UsersService,
        private trendingService: TrendingService
    ) {
        const statusesFromStorage = this.persistanceService.getJson('statusesContext') as LinkableResult<Status>;
        if (statusesFromStorage) {
            this.statuses = statusesFromStorage;
        }
    }

    public setContextStatuses(statuses: LinkableResult<Status> | undefined): void {
        this.statuses = statuses ? LinkableResult.copy(statuses) : undefined;
        this.allOlderStatusesDownloaded = false;
        this.allNewerStatusesDownloaded = false;

        this.persistanceService.setJson('statusesContext', this.statuses);
    }

    public clearContextStatuses(): void {
        this.statuses = undefined;
        this.allOlderStatusesDownloaded = false;
        this.allNewerStatusesDownloaded = false;
    }

    public hasContextStatuses(): boolean {
        return !!this.statuses && this.statuses.data.length > 0;
    }

    public async loadOlder(): Promise<LinkableResult<Status> | null> {
        if (!this.statuses?.maxId) {
            this.allOlderStatusesDownloaded = true;
            return null;
        }

        return await this.loadNextStatuses();
    }

    public async loadNewer(): Promise<LinkableResult<Status> | null> {
        if (!this.statuses?.minId) {
            this.allNewerStatusesDownloaded = true;
            return null;
        }

        return await this.loadPreviousStatuses();
    }

    public async getNext(id: string): Promise<Status | null> {
        if (!this.statuses || this.statuses.data.length === 0) {
            return null;
        }

        const currentIndex = this.statuses.data.findIndex(x => x.id === id);
        if (currentIndex < 0) {
            this.clearContextStatuses();
            return null;
        }

        if (currentIndex >= (this.statuses.data.length - 1)) {
            const loaded = await this.loadNextStatuses();
            if (!loaded) {
                return null;
            }
        }

        return this.statuses.data[currentIndex + 1];
    }

    public async getPrevious(id: string): Promise<Status | null> {
        if (!this.statuses || this.statuses.data.length === 0) {
            return null;
        }

        let currentIndex = this.statuses.data.findIndex(x => x.id === id);
        if (currentIndex < 0) {
            this.clearContextStatuses();
            return null;
        }

        if (currentIndex === 0) {
            const loaded = await this.loadPreviousStatuses();
            if (!loaded) {
                return null;
            }

            currentIndex = this.statuses.data.findIndex(x => x.id === id);
            if (currentIndex < 0) {
                this.clearContextStatuses();
                return null;
            }
        }

        return this.statuses.data[currentIndex - 1];
    }

    private async loadNextStatuses(): Promise<LinkableResult<Status> | null> {
        const older = await this.downloadStatuses(undefined, this.statuses?.maxId);

        if (this.statuses && older && older.data.length > 0) {
            this.statuses.data.push(...older.data);
            this.statuses.maxId = older.maxId;

            this.persistanceService.setJson('statusesContext', this.statuses);
            return older;
        }

        if (older?.data.length === 0 || !older?.maxId) {
            this.allOlderStatusesDownloaded = true;
        }

        return null;
    }

    private async loadPreviousStatuses(): Promise<LinkableResult<Status> | null> {
        const newer = await this.downloadStatuses(this.statuses?.minId, undefined);
        if (this.statuses && newer && newer.data.length > 0) {
            this.statuses.data.unshift(...newer.data);
            this.statuses.minId = newer.minId;

            this.persistanceService.setJson('statusesContext', this.statuses);
            return newer;
        }

        if (newer?.data.length === 0 || !newer?.minId) {
            this.allNewerStatusesDownloaded = true;
        }

        return null;
    }

    private async downloadStatuses(minId?: string, maxId?: string): Promise<LinkableResult<Status> | null> {
        if (this.statuses?.context === ContextTimeline.home) {
            return await this.timelineService.home(minId, maxId, undefined);
        }

        if (this.statuses?.context === ContextTimeline.bookmarks) {
            return await this.bookmarksService.list(minId, maxId, undefined);
        }

        if (this.statuses?.context === ContextTimeline.favourites) {
            return await this.favouritesService.list(minId, maxId, undefined);
        }

        if (this.statuses?.context === ContextTimeline.local) {
            return await this.timelineService.public(minId, maxId, undefined, undefined, true);
        }

        if (this.statuses?.context === ContextTimeline.global) {
            return await this.timelineService.public(minId, maxId, undefined, undefined, false);
        }

        if (this.statuses?.context === ContextTimeline.trendingStatusesDaily) {
            return await this.trendingService.statuses(minId, maxId, undefined, undefined, TrendingPeriod.Daily);
        }

        if (this.statuses?.context === ContextTimeline.trendingStatusesMonthly) {
            return await this.trendingService.statuses(minId, maxId, undefined, undefined, TrendingPeriod.Monthly);
        }

        if (this.statuses?.context === ContextTimeline.trendingStatusesYearly) {
            return await this.trendingService.statuses(minId, maxId, undefined, undefined, TrendingPeriod.Yearly);
        }

        if (this.statuses?.context === ContextTimeline.editors) {
            return await this.timelineService.featuredStatuses(minId, maxId, undefined, undefined);
        }

        if (this.statuses?.context === ContextTimeline.hashtag && this.statuses.hashtag) {
            return await this.timelineService.hashtag(this.statuses.hashtag, minId, maxId, undefined, undefined);
        }

        if (this.statuses?.context === ContextTimeline.category && this.statuses.category) {
            return await this.timelineService.category(this.statuses.category, minId, maxId, undefined, undefined);
        }

        if (this.statuses?.context === ContextTimeline.user && this.statuses.user) {
            return await this.usersService.statuses(this.statuses.user, minId, maxId, undefined, undefined);
        }

        return null;
    }
}