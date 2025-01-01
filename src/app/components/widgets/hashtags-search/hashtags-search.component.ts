import { BreakpointObserver } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Hashtag } from 'src/app/models/hashtag';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';

@Component({
    selector: 'app-hashtags-search',
    templateUrl: './hashtags-search.component.html',
    styleUrls: ['./hashtags-search.component.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class HashtagsSearchComponent extends ResponsiveComponent {
    private readonly numberOfVisibleStatuses = 10;

    @Input() hashtag!: Hashtag;
    statuses?: LinkableResult<Status>;
    isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private timelineService: TimelineService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    async lazyLoadData(): Promise<void> {
        this.statuses = await this.timelineService.hashtag(this.hashtag.name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
    }

    getImageSrc(status: Status): string | undefined {
        const attachments = this.getMainStatus(status).attachments;
        if (attachments && attachments.length > 0) {
            return attachments[0].smallFile?.url;
        }

        return undefined;
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }
}
