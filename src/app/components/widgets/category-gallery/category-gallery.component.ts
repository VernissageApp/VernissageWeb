import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Category } from 'src/app/models/category';
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
    @Input() categories?: Category[];
    @Input() categoryStatuses?: Map<string, LinkableResult<Status>>;

    constructor(
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    trackByFn(_: number, item: Status): string | undefined{
        return item.id;
    }

    trackByCategoryFn(_: number, item: Category): string | undefined{
        return item.id;
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
        const statuses = this.getLinkableStatuses(hashtag);
        this.contextStatusesService.setContextStatuses(statuses);
    }

    private getLinkableStatuses(category: string | undefined): LinkableResult<Status> | undefined {
        if (!category) {
            return undefined;
        }

        return this.categoryStatuses?.get(category) ?? undefined;
    }
}
