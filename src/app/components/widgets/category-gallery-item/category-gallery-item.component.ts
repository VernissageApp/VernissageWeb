import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Category } from 'src/app/models/category';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { TimelineService } from 'src/app/services/http/timeline.service';

@Component({
    selector: 'app-category-gallery-item',
    templateUrl: './category-gallery-item.component.html',
    styleUrls: ['./category-gallery-item.component.scss'],
    animations: fadeInAnimation
})
export class CategoryGalleryItemComponent extends ResponsiveComponent {
    private readonly numberOfVisibleStatuses = 10;

    @Input() category!: Category;
    statuses?: LinkableResult<Status>;

    constructor(
        private timelineService: TimelineService,
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    async lazyLoadData(): Promise<void> {
        this.statuses = await this.timelineService.category(this.category.name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
    }

    trackByFn(_: number, item: Status): string {
        return item.id;
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    onStatusClick(): void {
        this.contextStatusesService.setContextStatuses(this.statuses);
    }
}
