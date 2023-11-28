import { BreakpointObserver } from "@angular/cdk/layout";
import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/internal/Subscription";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { Responsive } from "src/app/common/responsive";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LinkableResult } from "src/app/models/linkable-result";
import { Status } from "src/app/models/status";
import { LoadingService } from "src/app/services/common/loading.service";
import { TimelineService } from "src/app/services/http/timeline.service";

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.page.html',
    styleUrls: ['./hashtag.page.scss'],
    animations: fadeInAnimation
})
export class HashtagPage extends Responsive {
    statuses?: LinkableResult<Status>;
    isReady = false;

    routeParamsSubscription?: Subscription;
    hashtag?: string;

    constructor(
        private timelineService: TimelineService,
        private loadingService: LoadingService,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async (params) => {
            this.loadingService.showLoader();
            this.hashtag = params['tag'] as string;

            this.statuses = await this.timelineService.hashtag(this.hashtag, undefined, undefined, undefined, undefined);
            this.statuses.context = ContextTimeline.hashtag;
            this.statuses.hashtag = this.hashtag;

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }
}
