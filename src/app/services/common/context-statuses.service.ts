import { Injectable } from '@angular/core';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { PersistanceService } from '../persistance/persistance.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { TimelineService } from '../http/timeline.service';
import { TrendingService } from '../http/trending.service';
import { TrendingPeriod } from 'src/app/models/trending-period';

@Injectable({
    providedIn: 'root'
})
export class ContextStatusesService {
    private statuses?: LinkableResult<Status>;

    constructor(
        private persistanceService: PersistanceService,
        private timelineService: TimelineService,
        private trendingService: TrendingService
    ) {
        const statusesFromStorage = this.persistanceService.getJson('statusesContext') as LinkableResult<Status>;
        if (statusesFromStorage) {
            this.statuses = statusesFromStorage;
        }
    }

    public setContextStatuses(statuses: LinkableResult<Status> | undefined): void {
        this.statuses = statuses;
        this.persistanceService.setJson('statusesContext', this.statuses);
    }

    public clearContextStatuses(): void {
        this.statuses = undefined;
    }

    public hasContextStatuses(): boolean {
        return !!this.statuses && this.statuses.data.length > 0;
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

        var currentIndex = this.statuses.data.findIndex(x => x.id === id);
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

    private async loadNextStatuses(): Promise<boolean> {
        const older = await this.downloadStatuses(undefined, this.statuses?.maxId);
        if (this.statuses && older && older.data.length > 0) {
            this.statuses.data.push(...older.data);
            this.statuses.maxId = older.maxId;

            this.persistanceService.setJson('statusesContext', this.statuses);
            return true;
        }

        return false;
    }

    private async loadPreviousStatuses(): Promise<boolean> {
        const newer = await this.downloadStatuses(this.statuses?.minId, undefined);
        if (this.statuses && newer && newer.data.length > 0) {
            this.statuses.data.unshift(...newer.data);
            this.statuses.minId = newer.minId;

            this.persistanceService.setJson('statusesContext', this.statuses);
            return true;
        }

        return false;
    }

    private async downloadStatuses(minId?: string, maxId?: string): Promise<LinkableResult<Status> | null> {
        if (this.statuses?.context === ContextTimeline.home) {
            return await this.timelineService.home(minId, maxId, undefined);
        }

        if (this.statuses?.context === ContextTimeline.local) {
            return await this.timelineService.public(minId, maxId, undefined, undefined, true);
        }

        if (this.statuses?.context === ContextTimeline.global) {
            return await this.timelineService.public(minId, maxId, undefined, undefined, false);
        }

        if (this.statuses?.context === ContextTimeline.trendingDaily) {
            return await this.trendingService.statuses(minId, maxId, undefined, undefined, TrendingPeriod.Daily);
        }

        if (this.statuses?.context === ContextTimeline.trendingMonthly) {
            return await this.trendingService.statuses(minId, maxId, undefined, undefined, TrendingPeriod.Monthly);
        }

        if (this.statuses?.context === ContextTimeline.trendingYearly) {
            return await this.trendingService.statuses(minId, maxId, undefined, undefined, TrendingPeriod.Yearly);
        }

        if (this.statuses?.context === ContextTimeline.editors) {
            return await this.timelineService.featured(minId, maxId, undefined, undefined);
        }

        return null;
    }
}