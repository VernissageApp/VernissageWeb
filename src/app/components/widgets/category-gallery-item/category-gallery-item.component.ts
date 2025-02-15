import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Category } from 'src/app/models/category';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { TimelineService } from 'src/app/services/http/timeline.service';

@Component({
    selector: 'app-category-gallery-item',
    templateUrl: './category-gallery-item.component.html',
    styleUrls: ['./category-gallery-item.component.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CategoryGalleryItemComponent extends ResponsiveComponent implements OnInit {
    public category = input.required<Category>();
    
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

    async lazyLoadData(): Promise<void> {
        const statusesInternal = await this.timelineService.category(this.category().name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
        this.statuses.set(statusesInternal);
    }

    protected getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    protected onStatusClick(): void {
        this.contextStatusesService.setContextStatuses(this.statuses());
    }
}
