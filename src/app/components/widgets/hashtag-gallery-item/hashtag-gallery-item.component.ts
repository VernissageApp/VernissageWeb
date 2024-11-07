import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Hashtag } from 'src/app/models/hashtag';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { TimelineService } from 'src/app/services/http/timeline.service';

@Component({
    selector: 'app-hashtag-gallery-item',
    templateUrl: './hashtag-gallery-item.component.html',
    styleUrls: ['./hashtag-gallery-item.component.scss'],
    animations: fadeInAnimation
})
export class HashtagGalleryItemComponent extends ResponsiveComponent implements OnInit {
    private readonly numberOfVisibleStatuses = 10;

    @Input() hashtag!: Hashtag;
    statuses?: LinkableResult<Status>;
    alwaysShowNSFW = false;

    constructor(
        private timelineService: TimelineService,
        private preferencesService: PreferencesService,
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.alwaysShowNSFW = this.preferencesService.alwaysShowNSFW;
    }

    async lazyLoadData(): Promise<void> {
        this.statuses = await this.timelineService.hashtag(this.hashtag.name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
    }

    trackByFn(_: number, item: Status): string | undefined{
        return item.id;
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    onStatusClick(): void {
        this.contextStatusesService.setContextStatuses(this.statuses);
    }
}
