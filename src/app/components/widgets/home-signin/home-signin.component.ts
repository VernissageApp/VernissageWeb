import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
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
import { OnAttach, OnDetach } from 'src/app/directives/app-router-outlet.directive';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-home-signin',
    templateUrl: './home-signin.component.html',
    styleUrls: ['./home-signin.component.scss'],
    animations: fadeInAnimation
})
export class HomeSigninComponent extends ResponsiveComponent implements OnInit, OnDestroy, OnAttach, OnDetach {
    statuses?: LinkableResult<Status>;
    timeline = 'private';
    isReady = false;
    isLoggedIn = false;
    isPageVisible = true;
    lastRefreshTime = new Date();
    isDetached = false;

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
        private changeDetectorRef: ChangeDetectorRef,
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
                
                if (navigationEndEvent.urlAfterRedirects.startsWith('/home')) {
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

    onDetach(): void {
        this.isDetached = true;
        this.changeDetectorRef.detectChanges();
    }

    onAttach(): void {
        this.isDetached = false;
        this.changeDetectorRef.detectChanges();
    }

    @HostListener('document:visibilitychange', ['$event'])
    async visibilityChange(event: any): Promise<void> {
        if (!event.target.hidden && this.isPageVisible) {
            const twoHours = 60000 * 120;
            const lastRefreshTimePlusTwoHours = new Date(this.lastRefreshTime.getTime() + twoHours);
            const currentTime = new Date();

            if (lastRefreshTimePlusTwoHours < currentTime) {
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
            case 'local': {
                this.timeline = 'local';
                const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                statuses.context = ContextTimeline.local;

                this.statuses = statuses;
                break;
            }
            case 'global': {
                this.timeline = 'global';
                const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, false);
                statuses.context = ContextTimeline.global;

                this.statuses = statuses;
                break;
            }
            default:
                if (this.isLoggedIn) {
                    this.timeline = 'private';
                    const statuses = await this.timelineService.home();
                    statuses.context = ContextTimeline.home;

                    this.statuses = statuses;
                } else {
                    this.timeline = 'local';
                    const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                    statuses.context = ContextTimeline.local;

                    this.statuses = statuses;
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
