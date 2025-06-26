import { Component, OnInit, OnDestroy, signal, model, ChangeDetectionStrategy, inject, HostListener } from "@angular/core";
import { ActivatedRoute, NavigationExtras } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ReusableGalleryPageComponent } from "src/app/common/reusable-gallery-page";
import { ContextTimeline } from "src/app/models/context-timeline";
import { Hashtag } from "src/app/models/hashtag";
import { LinkableResult } from "src/app/models/linkable-result";
import { TrendingPeriod } from "src/app/models/trending-period";
import { User } from "src/app/models/user";
import { AuthorizationService } from "src/app/services/authorization/authorization.service";
import { FocusTrackerService } from "src/app/services/common/focus-tracker.service";
import { LoadingService } from "src/app/services/common/loading.service";
import { SettingsService } from "src/app/services/http/settings.service";
import { TrendingService } from "src/app/services/http/trending.service";

@Component({
    selector: 'app-trending',
    templateUrl: './trending.page.html',
    styleUrls: ['./trending.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TrendingPage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected readonly trendingPeriod = TrendingPeriod;

    protected users = signal<LinkableResult<User> | undefined>(undefined);
    protected hashtags = signal<LinkableResult<Hashtag> | undefined>(undefined);

    protected period = model(TrendingPeriod.Daily);
    protected trending = model('statuses');
    protected selectedTrending = signal('statuses');

    protected isReady = signal(false);
    protected showHashtags = signal(false);

    private routeParamsSubscription?: Subscription;

    private trendingService = inject(TrendingService);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private authorizationService = inject(AuthorizationService);
    private activatedRoute = inject(ActivatedRoute);
    private focusTrackerService = inject(FocusTrackerService);

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

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (this.focusTrackerService.isCurrentlyFocused || event.repeat || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        switch (event.key) {
            case '1':
                this.router.navigate(['/trending'], { queryParams: { trending: 'statuses', period: 'daily' } });
                break;
            case '2':
                this.router.navigate(['/trending'], { queryParams: { trending: 'users', period: 'daily' } });
                break;
            case '3':
                this.router.navigate(['/trending'], { queryParams: { trending: 'hashtags', period: 'daily' } });
                break;
        }
    }

    protected onSelectionChange(): void {
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
