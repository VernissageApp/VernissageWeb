import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Status } from 'src/app/models/status';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LinkableResult } from 'src/app/models/linkable-result';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { BookmarksService } from 'src/app/services/http/bookmarks.service';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { OnAttach, OnDetach } from 'src/app/directives/app-router-outlet.directive';

@Component({
    selector: 'app-bookmarks',
    templateUrl: './bookmarks.page.html',
    styleUrls: ['./bookmarks.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class BookmarksPage extends ResponsiveComponent implements OnInit, OnDestroy, OnAttach, OnDetach {
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected isReady = signal(false);
    protected isDetached = signal(false);

    protected user = signal<User | undefined>(undefined);
    protected fullName = signal('');

    private routeParamsSubscription?: Subscription;
    private routeNavigationEndSubscription?: Subscription;

    constructor(
        private contextStatusesService: ContextStatusesService,
        private bookmarksService: BookmarksService,
        private loadingService: LoadingService,
        private authorizationService: AuthorizationService,
        private userDisplayService: UserDisplayService,
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
                if (navigationEndEvent.urlAfterRedirects === '/bookmarks') {
                    this.contextStatusesService.setContextStatuses(this.statuses());
                }
            });

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {

            this.loadingService.showLoader();

            this.user.set(this.authorizationService.getUser());
            this.fullName.set(this.userDisplayService.displayName(this.user()));

            const downloadedStatuses = await this.bookmarksService.list();
            downloadedStatuses.context = ContextTimeline.bookmarks;

            this.statuses.set(downloadedStatuses);

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
        this.changeDetectorRef.detectChanges();
    }

    onAttach(): void {
        this.isDetached.set(false);
        this.changeDetectorRef.detectChanges();
    }
}
