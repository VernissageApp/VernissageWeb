import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';
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
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HashtagGalleryItemComponent extends ResponsiveComponent implements OnInit {
    public hashtag = input.required<Hashtag>();
    
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected alwaysShowNSFW = signal(false);

    private readonly numberOfVisibleStatuses = 10;

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

        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
    }

    protected async lazyLoadData(): Promise<void> {
        const downloadedStatuses = await this.timelineService.hashtag(this.hashtag().name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
        this.statuses.set(downloadedStatuses);
    }

    protected getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    protected onStatusClick(): void {
        this.contextStatusesService.setContextStatuses(this.statuses());
    }
}
