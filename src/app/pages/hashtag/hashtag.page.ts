import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/internal/Subscription";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ReusableGalleryPageComponent } from "src/app/common/reusable-gallery-page";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LoadingService } from "src/app/services/common/loading.service";
import { TimelineService } from "src/app/services/http/timeline.service";

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.page.html',
    styleUrls: ['./hashtag.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HashtagPage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected hashtag = signal('');

    private routeParamsSubscription?: Subscription;

    constructor(
        private timelineService: TimelineService,
        private loadingService: LoadingService,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async (params) => {
            this.loadingService.showLoader();
            this.hashtag.set(params['tag'] as string);

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
        const downloadStatuses = await this.timelineService.hashtag(this.hashtag(), undefined, undefined, undefined, undefined);
        downloadStatuses.context = ContextTimeline.hashtag;
        downloadStatuses.hashtag = this.hashtag();

        this.statuses.set(downloadStatuses);
    }
}
