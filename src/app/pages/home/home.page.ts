import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LinkableResult } from 'src/app/models/linkable-result';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    animations: fadeInAnimation
})
export class HomePage extends Responsive {
    statuses?: LinkableResult<Status>;
    timeline: String = 'private';
    isReady = false;

    routeParamsSubscription?: Subscription;
    routeNavigationEndSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private contextStatusesService: ContextStatusesService,
        private timelineService: TimelineService,
        private loadingService: LoadingService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver) {
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
                }
            });

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {

            this.loadingService.showLoader();
            const pageType = params['t'] as string;

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
                    if (this.isLoggedIn()) {
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

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    onTimelineChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { t: this.timeline },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    isLoggedIn(): Boolean {
        return this.authorizationService.isLoggedIn();
    }
}
