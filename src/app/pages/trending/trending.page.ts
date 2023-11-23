import { BreakpointObserver } from "@angular/cdk/layout";
import { Component } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { Responsive } from "src/app/common/responsive";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LinkableResult } from "src/app/models/linkable-result";
import { Status } from "src/app/models/status";
import { TrendingPeriod } from "src/app/models/trending-period";
import { LoadingService } from "src/app/services/common/loading.service";
import { TrendingService } from "src/app/services/http/trending.service";

@Component({
    selector: 'app-trending',
    templateUrl: './trending.page.html',
    styleUrls: ['./trending.page.scss'],
    animations: fadeInAnimation
})
export class TrendingPage extends Responsive {
    readonly trendingPeriod = TrendingPeriod;

    statuses?: LinkableResult<Status>;
    period = TrendingPeriod.Daily;
    trending: String = 'statuses';
    isReady = false;

    routeParamsSubscription?: Subscription;

    constructor(
        private trendingService: TrendingService,
        private loadingService: LoadingService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            this.loadingService.showLoader();
            this.period = params['period'] as TrendingPeriod ?? TrendingPeriod.Daily;
            this.trending  = params['trending'] as string ?? 'statuses';

            switch(this.trending) {
                case 'statuses':
                    await this.loadTrendingStatuses();
                    break;
                case 'users':
                    this.statuses = new LinkableResult<Status>();
                    break;
                case 'hashtags':
                    this.statuses = new LinkableResult<Status>();
                    break;
            }

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    onSelectionChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { trending: this.trending, period: this.period },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    private async loadTrendingStatuses(): Promise<void> {
        switch(this.period) {
            case TrendingPeriod.Daily:
                this.statuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, this.period);
                this.statuses.context = ContextTimeline.trendingDaily;
                break;
            case TrendingPeriod.Monthly:
                this.statuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, this.period);
                this.statuses.context = ContextTimeline.trendingMonthly;
                break;
            case TrendingPeriod.Yearly:
                this.statuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, this.period);
                this.statuses.context = ContextTimeline.trendingYearly;
                break;
        }
    }
}
