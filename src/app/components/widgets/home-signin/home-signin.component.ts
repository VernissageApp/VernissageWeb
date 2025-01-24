import { Component, OnInit, OnDestroy, HostListener, signal, model, ChangeDetectionStrategy } from '@angular/core';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { SettingsService } from 'src/app/services/http/settings.service';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ReusableGalleryPageComponent } from 'src/app/common/reusable-gallery-page';

@Component({
    selector: 'app-home-signin',
    templateUrl: './home-signin.component.html',
    styleUrls: ['./home-signin.component.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeSigninComponent extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected timeline = model('private');
    protected isReady = signal(false);
    protected isLoggedIn = signal(false);
    
    private lastRefreshTime = new Date();
    private routeParamsSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private timelineService: TimelineService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            if (!this.hasAccessToLocalTimeline()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();

            const pageType = params['t'] as string;
            await this.loadData(pageType);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }

    @HostListener('document:visibilitychange', ['$event'])
    async visibilityChange(event: any): Promise<void> {
        if (!event.target.hidden && this.isPageVisible()) {
            const twoHours = 60000 * 120;
            const lastRefreshTimePlusTwoHours = new Date(this.lastRefreshTime.getTime() + twoHours);
            const currentTime = new Date();

            if (lastRefreshTimePlusTwoHours < currentTime) {
                this.loadingService.showLoader();
                await this.loadData(this.timeline());
                this.loadingService.hideLoader();
            }
        }
    }

    protected onTimelineChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                t: this.timeline()
            },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    private async loadData(pageType: string): Promise<void> {
        const isLoggedInInternal = await this.authorizationService.isLoggedIn();
        this.isLoggedIn.set(isLoggedInInternal);

        this.lastRefreshTime = new Date();

        switch(pageType) {
            case 'local': {
                this.timeline.set('local');
                const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                statuses.context = ContextTimeline.local;

                this.statuses.set(statuses);
                break;
            }
            case 'global': {
                this.timeline.set('global');
                const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, false);
                statuses.context = ContextTimeline.global;

                this.statuses.set(statuses);
                break;
            }
            default:
                if (this.isLoggedIn()) {
                    this.timeline.set('private');
                    const statuses = await this.timelineService.home();
                    statuses.context = ContextTimeline.home;

                    this.statuses.set(statuses);
                } else {
                    this.timeline.set('local');
                    const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                    statuses.context = ContextTimeline.local;

                    this.statuses.set(statuses);
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
