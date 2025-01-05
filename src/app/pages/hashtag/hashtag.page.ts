import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/internal/Subscription";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LinkableResult } from "src/app/models/linkable-result";
import { Status } from "src/app/models/status";
import { LoadingService } from "src/app/services/common/loading.service";
import { TimelineService } from "src/app/services/http/timeline.service";

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.page.html',
    styleUrls: ['./hashtag.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class HashtagPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
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

            const downloadStatuses = await this.timelineService.hashtag(this.hashtag(), undefined, undefined, undefined, undefined);
            downloadStatuses.context = ContextTimeline.hashtag;
            downloadStatuses.hashtag = this.hashtag();

            this.statuses.set(downloadStatuses);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }
}
