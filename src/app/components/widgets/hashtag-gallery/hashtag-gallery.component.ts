import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Responsive } from 'src/app/common/responsive';
import { Attachment } from 'src/app/models/attachment';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { Hashtag } from 'src/app/models/hashtag';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { TimelineService } from 'src/app/services/http/timeline.service';

@Component({
    selector: 'app-hashtag-gallery',
    templateUrl: './hashtag-gallery.component.html',
    styleUrls: ['./hashtag-gallery.component.scss'],
    animations: fadeInAnimation
})
export class HashtagGalleryComponent extends Responsive implements OnChanges {
    private readonly numberOfVisibleHashtagsChunk = 10;
    private readonly numberOfVisibleStatuses = 10;

    @Input() hashtags?: LinkableResult<Hashtag>;

    private hashtagStatuses = new Map<string, LinkableResult<Status>>();
    private numberOfVisibleHashtags = this.numberOfVisibleHashtagsChunk;
    protected visibleHashtags: Hashtag[] = [];

    constructor(
        private timelineService: TimelineService,
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes.hashtags) {
            this.numberOfVisibleHashtags = this.numberOfVisibleHashtagsChunk;
            await this.loadStatuses();
        }
    }

    trackByFn(_: number, item: Status): string | undefined{
        return item.id;
    }

    trackByHashtagFn(_: number, item: Hashtag): string | undefined{
        return item.name;
    }

    getStatuses(userName: string | undefined): Status[] {
        if (!userName) {
            return [];
        }

        return this.getLinkableStatuses(userName)?.data ?? [];
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    onStatusClick(hashtag: string | undefined): void {
        let statuses = this.getLinkableStatuses(hashtag);
        this.contextStatusesService.setContextStatuses(statuses);
    }

    async onNearEndScroll(): Promise<void> {
        this.numberOfVisibleHashtags = this.numberOfVisibleHashtags + this.numberOfVisibleHashtagsChunk;
        await this.loadStatuses();
    }

    private getLinkableStatuses(hashtag: string | undefined): LinkableResult<Status> | undefined {
        if (!hashtag) {
            return undefined;
        }

        return this.hashtagStatuses.get(hashtag) ?? undefined;
    }

    private async loadStatuses(): Promise<void> {
        if (!this.hashtags || this.hashtags.data?.length === 0) {
            this.visibleHashtags = [];
            return;
        }

        this.visibleHashtags = this.hashtags.data.slice(0, this.numberOfVisibleHashtags);

        for (let hashtag of this.visibleHashtags) {
            if (this.hashtagStatuses.has(hashtag.name)) {
                continue;
            }

            let statuses = await this.timelineService.hashtag(hashtag.name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
            statuses.context = ContextTimeline.hashtag;
            statuses.hashtag = hashtag.name;

            this.hashtagStatuses.set(hashtag.name, statuses);
        }
    }
}
