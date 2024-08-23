import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { ContextTimeline } from "src/app/models/context-timeline";
import { Hashtag } from "src/app/models/hashtag";
import { LinkableResult } from "src/app/models/linkable-result";
import { Status } from "src/app/models/status";
import { TrendingPeriod } from "src/app/models/trending-period";
import { User } from "src/app/models/user";
import { AuthorizationService } from "src/app/services/authorization/authorization.service";
import { LoadingService } from "src/app/services/common/loading.service";
import { SettingsService } from "src/app/services/http/settings.service";
import { TrendingService } from "src/app/services/http/trending.service";

@Component({
    selector: 'app-trending',
    templateUrl: './trending.page.html',
    styleUrls: ['./trending.page.scss'],
    animations: fadeInAnimation
})
export class TrendingPage extends ResponsiveComponent implements OnInit, OnDestroy {
    readonly trendingPeriod = TrendingPeriod;

    statuses?: LinkableResult<Status>;
    users?: LinkableResult<User>;
    hashtags?: LinkableResult<Hashtag>;

    period = TrendingPeriod.Daily;
    trending = 'statuses';
    selectedTrending = 'statuses';
    isReady = false;
    showHashtags = false;

    routeParamsSubscription?: Subscription;

    constructor(
        private trendingService: TrendingService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private authorizationService: AuthorizationService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            if (!this.hasAccessToTrending()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();
            const internalPeriod = params['period'] as TrendingPeriod ?? TrendingPeriod.Daily;
            const internalTrending  = params['trending'] as string ?? 'statuses';
            this.showHashtags = this.hasAccessToHashtags();

            switch(internalTrending) {
                case 'statuses':
                    await this.loadTrendingStatuses(internalPeriod);
                    break;
                case 'users':
                    await this.loadTrendingUsers(internalPeriod);
                    break;
                case 'hashtags':
                    await this.loadTrendingHashtags(internalPeriod);
                    break;
            }

            this.period = internalPeriod;
            this.trending  = internalTrending;
            this.selectedTrending = internalTrending;

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

    private async loadTrendingStatuses(internalPeriod: TrendingPeriod): Promise<void> {
        switch(internalPeriod) {
            case TrendingPeriod.Daily:
                this.statuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, internalPeriod);
                this.statuses.context = ContextTimeline.trendingStatusesDaily;
                break;
            case TrendingPeriod.Monthly:
                this.statuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, internalPeriod);
                this.statuses.context = ContextTimeline.trendingStatusesMonthly;
                break;
            case TrendingPeriod.Yearly:
                this.statuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, internalPeriod);
                this.statuses.context = ContextTimeline.trendingStatusesYearly;
                break;
        }
    }

    private async loadTrendingUsers(internalPeriod: TrendingPeriod): Promise<void> {
        switch(internalPeriod) {
            case TrendingPeriod.Daily:
                this.users = await this.trendingService.users(undefined, undefined, undefined, undefined, internalPeriod);
                break;
            case TrendingPeriod.Monthly:
                this.users = await this.trendingService.users(undefined, undefined, undefined, undefined, internalPeriod);
                break;
            case TrendingPeriod.Yearly:
                this.users = await this.trendingService.users(undefined, undefined, undefined, undefined, internalPeriod);
                break;
        }
    }

    private async loadTrendingHashtags(internalPeriod: TrendingPeriod): Promise<void> {
        switch(internalPeriod) {
            case TrendingPeriod.Daily:
                this.hashtags = await this.trendingService.hashtags(undefined, undefined, undefined, undefined, internalPeriod);
                break;
            case TrendingPeriod.Monthly:
                this.hashtags = await this.trendingService.hashtags(undefined, undefined, undefined, undefined, internalPeriod);
                break;
            case TrendingPeriod.Yearly:
                this.hashtags = await this.trendingService.hashtags(undefined, undefined, undefined, undefined, internalPeriod);
                break;
        }
    }

    private hasAccessToHashtags(): boolean {
        if (this.authorizationService.getUser()) {
            return true;
        }

        if (this.settingsService.publicSettings?.showHashtagsForAnonymous) {
            return true;
        }

        return false;
    }

    private hasAccessToTrending(): boolean {
        if (this.authorizationService.getUser()) {
            return true;
        }

        if (this.settingsService.publicSettings?.showTrendingForAnonymous) {
            return true;
        }

        return false;
    }
}
