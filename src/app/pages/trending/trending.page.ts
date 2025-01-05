import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal, model } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { OnAttach, OnDetach } from "src/app/directives/app-router-outlet.directive";
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
    animations: fadeInAnimation,
    standalone: false
})
export class TrendingPage extends ResponsiveComponent implements OnInit, OnDestroy, OnAttach, OnDetach {
    protected readonly trendingPeriod = TrendingPeriod;

    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected users = signal<LinkableResult<User> | undefined>(undefined);
    protected hashtags = signal<LinkableResult<Hashtag> | undefined>(undefined);

    protected period = model(TrendingPeriod.Daily);
    protected trending = model('statuses');
    protected selectedTrending = signal('statuses');

    protected isReady = signal(false);
    protected isDetached = signal(false);
    protected showHashtags = signal(false);

    private routeParamsSubscription?: Subscription;

    constructor(
        private trendingService: TrendingService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private authorizationService: AuthorizationService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef,
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
            this.showHashtags.set(this.hasAccessToHashtags());

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

            this.period.set(internalPeriod);
            this.trending.set(internalTrending);
            this.selectedTrending.set(internalTrending);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    onDetach(): void {
        this.isDetached.set(true);
        this.changeDetectorRef.detectChanges();
    }

    onAttach(): void {
        this.isDetached.set(false);
        this.changeDetectorRef.detectChanges();
    }

    onSelectionChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { trending: this.trending(), period: this.period() },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    private async loadTrendingStatuses(internalPeriod: TrendingPeriod): Promise<void> {
        switch(internalPeriod) {
            case TrendingPeriod.Daily: {
                const internalStatuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, internalPeriod);
                internalStatuses.context = ContextTimeline.trendingStatusesDaily;

                this.statuses.set(internalStatuses);
                break;
            }
            case TrendingPeriod.Monthly: {
                const internalStatuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, internalPeriod);
                internalStatuses.context = ContextTimeline.trendingStatusesMonthly;

                this.statuses.set(internalStatuses);
                break;
            }
            case TrendingPeriod.Yearly: {
                const internalStatuses = await this.trendingService.statuses(undefined, undefined, undefined, undefined, internalPeriod);
                internalStatuses.context = ContextTimeline.trendingStatusesYearly;

                this.statuses.set(internalStatuses);
                break;
            }
        }
    }

    private async loadTrendingUsers(internalPeriod: TrendingPeriod): Promise<void> {
        switch(internalPeriod) {
            case TrendingPeriod.Daily: {
                const internalUsers = await this.trendingService.users(undefined, undefined, undefined, undefined, internalPeriod);
                this.users.set(internalUsers);
                break;
            }
            case TrendingPeriod.Monthly: {
                const internalUsers = await this.trendingService.users(undefined, undefined, undefined, undefined, internalPeriod);
                this.users.set(internalUsers);
                break;
            }
            case TrendingPeriod.Yearly: {
                const internalUsers = await this.trendingService.users(undefined, undefined, undefined, undefined, internalPeriod);
                this.users.set(internalUsers);
                break;
            }
        }
    }

    private async loadTrendingHashtags(internalPeriod: TrendingPeriod): Promise<void> {
        switch(internalPeriod) {
            case TrendingPeriod.Daily: {
                const internalHashtags = await this.trendingService.hashtags(undefined, undefined, undefined, undefined, internalPeriod);
                this.hashtags.set(internalHashtags);
                break;
            }
            case TrendingPeriod.Monthly: {
                const internalHashtags = await this.trendingService.hashtags(undefined, undefined, undefined, undefined, internalPeriod);
                this.hashtags.set(internalHashtags);
                break;
            }
            case TrendingPeriod.Yearly: {
                const internalHashtags = await this.trendingService.hashtags(undefined, undefined, undefined, undefined, internalPeriod);
                this.hashtags.set(internalHashtags);
                break;
            }
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
