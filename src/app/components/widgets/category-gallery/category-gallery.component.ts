import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { CategoryStatuses } from 'src/app/models/category-statuses';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';

@Component({
    selector: 'app-category-gallery',
    templateUrl: './category-gallery.component.html',
    styleUrls: ['./category-gallery.component.scss'],
    animations: fadeInAnimation
})
export class CategoryGalleryComponent extends ResponsiveComponent {
    @Input() categoryStatuses?: CategoryStatuses[] = [];

    constructor(
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    trackByFn(_: number, item: Status): string {
        return item.id;
    }

    trackByCategoryFn(_: number, item: CategoryStatuses): string {
        return item.id;
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    onStatusClick(statuses: LinkableResult<Status>): void {
        this.contextStatusesService.setContextStatuses(statuses);
    }
}
