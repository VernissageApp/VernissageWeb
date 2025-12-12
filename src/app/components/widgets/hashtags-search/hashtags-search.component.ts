import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Hashtag } from 'src/app/models/hashtag';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';

@Component({
    selector: 'app-hashtags-search',
    templateUrl: './hashtags-search.component.html',
    styleUrls: ['./hashtags-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HashtagsSearchComponent extends ResponsiveComponent {
    public hashtag = input.required<Hashtag>();

    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected isBrowser = signal(false);

    private readonly numberOfVisibleStatuses = 10;

    private platformId = inject(PLATFORM_ID);
    private timelineService = inject(TimelineService);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }

    protected async lazyLoadData(): Promise<void> {
        const downloadedStatuses = await this.timelineService.hashtag(this.hashtag().name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
        this.statuses.set(downloadedStatuses);
    }

    protected getImageSrc(status: Status): string | undefined {
        const attachments = this.getMainStatus(status).attachments;
        if (attachments && attachments.length > 0) {
            return attachments[0].smallFile?.url;
        }

        return undefined;
    }

    protected getImageAlt(status: Status): string | undefined {
        const attachments = this.getMainStatus(status).attachments;
        if (attachments && attachments.length > 0) {
            return attachments[0].description;
        }

        return undefined;
    }

    private getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }
}
