import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReusableGalleryPageComponent } from 'src/app/common/reusable-gallery-page';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { LoadingService } from 'src/app/services/common/loading.service';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { GalleryComponent } from '../../components/widgets/gallery/gallery.component';

@Component({
    selector: 'app-camera',
    templateUrl: './camera.page.html',
    styleUrls: ['./camera.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, GalleryComponent]
})
export class CameraPage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected camera = signal('');

    private routeParamsSubscription?: Subscription;

    private timelineService = inject(TimelineService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.loadingService.showLoader();
            this.pageUrl = this.router.url.split('?')[0];
            this.camera.set(params['camera'] as string);

            this.statuses.set(undefined);
            await this.loadFirstStatusesSet();

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }

    private async loadFirstStatusesSet(): Promise<void> {
        const downloadedStatuses = await this.timelineService.camera(this.camera(), undefined, undefined, undefined, undefined);
        downloadedStatuses.context = ContextTimeline.camera;
        downloadedStatuses.camera = this.camera();

        this.statuses.set(downloadedStatuses);
    }
}
