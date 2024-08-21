import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LinkableResult } from 'src/app/models/linkable-result';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    animations: fadeInAnimation
})
export class HomePage extends ResponsiveComponent implements OnInit, OnDestroy {
    statuses?: LinkableResult<Status>;
    timeline = 'private';
    isReady = false;
    isLoggedIn = false;
    isPageVisible = true;
    lastRefreshTime = new Date();

    routeParamsSubscription?: Subscription;
    routeNavigationEndSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private contextStatusesService: ContextStatusesService,
        private timelineService: TimelineService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                const navigationEndEvent = event as NavigationEnd;
                
                if (navigationEndEvent.urlAfterRedirects === '/home') {
                    this.contextStatusesService.setContextStatuses(this.statuses);
                    this.isPageVisible = true;
                } else {
                    this.isPageVisible = false;
                }
            });

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            if (!this.hasAccessToLocalTimeline()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();

            const pageType = params['t'] as string;
            await this.loadData(pageType);

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    @HostListener('document:visibilitychange', ['$event'])
    async visibilityChange(event: any): Promise<void> {
        if (!event.target.hidden && this.isPageVisible) {
            const lastRefreshTimePlusMinute = new Date(this.lastRefreshTime.getTime() + 60000);
            const currentTime = new Date();

            if (lastRefreshTimePlusMinute < currentTime) {
                this.loadingService.showLoader();
                await this.loadData(this.timeline);
                this.loadingService.hideLoader();
            }
        }
    }

    onTimelineChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                t: this.timeline
            },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    private async loadData(pageType: string): Promise<void> {
        this.isLoggedIn = await this.authorizationService.isLoggedIn();
        this.lastRefreshTime = new Date();

        switch(pageType) {
            case 'local':
                this.timeline = 'local';
                this.statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                this.statuses.context = ContextTimeline.local;
                break;
            case 'global':
                this.timeline = 'global';
                this.statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, false);
                this.statuses.context = ContextTimeline.global;
                break;
            default:
                if (this.isLoggedIn) {
                    this.timeline = 'private';
                    this.statuses = await this.timelineService.home();
                    this.statuses.context = ContextTimeline.home;
                } else {
                    this.timeline = 'local';
                    this.statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                    this.statuses.context = ContextTimeline.local;
                }
                break;
        }
    }

    private hasAccessToLocalTimeline(): boolean {
        if (this.authorizationService.getUser()) {
            return true;
        }

        if (this.settingsService.publicSettings?.showLocalTimelineForAnonymous) {
            return true;
        }

        return false;
    }
}
