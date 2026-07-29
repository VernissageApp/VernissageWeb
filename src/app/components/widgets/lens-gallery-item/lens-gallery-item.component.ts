import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { LazyLoadDirective } from 'src/app/directives/lazy-load.directive';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { Lens } from 'src/app/models/lens';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { BlurhashImageComponent } from '../blurhash-image/blurhash-image.component';
import { ImageComponent } from '../image/image.component';

@Component({
    selector: 'app-lens-gallery-item',
    templateUrl: './lens-gallery-item.component.html',
    styleUrls: ['./lens-gallery-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LazyLoadDirective, RouterLink, MatIcon, BlurhashImageComponent, ImageComponent]
})
export class LensGalleryItemComponent extends ResponsiveComponent implements OnInit {
    public lens = input.required<Lens>();

    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected alwaysShowNSFW = signal(false);

    private readonly numberOfVisibleStatuses = 10;

    private timelineService = inject(TimelineService);
    private preferencesService = inject(PreferencesService);
    private contextStatusesService = inject(ContextStatusesService);

    override ngOnInit(): void {
        super.ngOnInit();
        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
    }

    async lazyLoadData(): Promise<void> {
        const statusesInternal = await this.timelineService.lens(this.lens().name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
        statusesInternal.context = ContextTimeline.lens;
        statusesInternal.lens = this.lens().name;
        this.statuses.set(statusesInternal);
    }

    protected getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    protected onStatusClick(): void {
        this.contextStatusesService.setContextStatuses(this.statuses());
    }
}
