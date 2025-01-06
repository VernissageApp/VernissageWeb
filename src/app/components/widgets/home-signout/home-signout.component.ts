import { Component, OnInit, OnDestroy, HostListener, signal, ChangeDetectionStrategy } from '@angular/core';
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
    selector: 'app-home-signout',
    templateUrl: './home-signout.component.html',
    styleUrls: ['./home-signout.component.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeSignoutComponent extends ResponsiveComponent implements OnInit, OnDestroy, OnAttach, OnDetach {
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected isReady = signal(false);
    protected showEditorsChoice = signal(false);
    protected isDetached = signal(false);
    protected mastodonUrl = signal<string | undefined>(undefined);
    
    private isPageVisible = true;
    private lastRefreshTime = new Date();
    private routeParamsSubscription?: Subscription;
    private routeNavigationEndSubscription?: Subscription;

    constructor(
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

        const internalMastodonUrl = this.settingsService.publicSettings?.mastodonUrl ?? '';
        if (internalMastodonUrl.length > 0) {
            this.mastodonUrl.set(internalMastodonUrl);
        }

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                const navigationEndEvent = event as NavigationEnd;
                
                if (navigationEndEvent.urlAfterRedirects.startsWith('/home')) {
                    this.contextStatusesService.setContextStatuses(this.statuses());
                    this.isPageVisible = true;
                } else {
                    this.isPageVisible = false;
                }
            });

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {
            this.loadingService.showLoader();
            await this.loadData();

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    onDetach(): void {
        this.isDetached.set(true);
    }

    onAttach(): void {
        this.isDetached.set(false);
    }

    @HostListener('document:visibilitychange', ['$event'])
    async visibilityChange(event: any): Promise<void> {
        if (!event.target.hidden && this.isPageVisible) {
            const twoHours = 60000 * 120;
            const lastRefreshTimePlusTwoHours = new Date(this.lastRefreshTime.getTime() + twoHours);
            const currentTime = new Date();

            if (lastRefreshTimePlusTwoHours < currentTime) {
                this.loadingService.showLoader();
                await this.loadData();
                this.loadingService.hideLoader();
            }
        }
    }

    private async loadData(): Promise<void> {
        this.showEditorsChoice.set(this.settingsService.publicSettings?.showEditorsChoiceForAnonymous ?? false);
        
        if (this.showEditorsChoice()) {
            this.lastRefreshTime = new Date();
            const statuses = await this.timelineService.featuredStatuses(undefined, undefined, undefined, undefined);
            statuses.context = ContextTimeline.editors;

            this.statuses.set(statuses);
        }
    }
}
