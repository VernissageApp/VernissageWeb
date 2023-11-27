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
    @Input() hashtags?: LinkableResult<Hashtag>;
    private hashtagStatuses = new Map<string, LinkableResult<Status>>();

    constructor(
        private timelineService: TimelineService,
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes.hashtags) {
            await this.loadStatuses();
        }
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

    getMainAttachmentSrc(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.smallFile?.url ?? '';
    }

    getMainAttachmentAlt(status: Status): string | undefined {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.description;
    }

    getMainAttachmentBlurhash(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    onStatusClick(hashtag: string | undefined): void {
        let statuses = this.getLinkableStatuses(hashtag);
        this.contextStatusesService.setContextStatuses(statuses);
    }

    private getLinkableStatuses(hashtag: string | undefined): LinkableResult<Status> | undefined {
        if (!hashtag) {
            return undefined;
        }

        return this.hashtagStatuses.get(hashtag) ?? undefined;
    }

    private async loadStatuses(): Promise<void> {
        if (!this.hashtags) {
            return;
        }

        for(let hashtag of this.hashtags?.data) {
            let statuses = await this.timelineService.hashtag(hashtag.name, undefined, undefined, undefined, undefined);
            statuses.context = ContextTimeline.hashtag;
            statuses.hashtag = hashtag.name;

            this.hashtagStatuses.set(hashtag.name, statuses);
        }
    }

    private getMainAttachment(status: Status): Attachment | null {
        const mainStatus = status.reblog ?? status;

        if (!mainStatus.attachments) {
            return null;
        }
    
        if (mainStatus.attachments?.length === 0) {
            return null;
        }
    
        return mainStatus.attachments[0]
    }
}
