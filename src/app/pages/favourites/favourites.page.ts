import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { FavouritesService } from 'src/app/services/http/favourites.service';

@Component({
    selector: 'app-favourites',
    templateUrl: './favourites.page.html',
    styleUrls: ['./favourites.page.scss'],
    animations: fadeInAnimation
})
export class FavouritesPage extends ResponsiveComponent implements OnInit, OnDestroy {
    statuses?: LinkableResult<Status>;
    isReady = false;

    routeParamsSubscription?: Subscription;
    routeNavigationEndSubscription?: Subscription;

    constructor(
        private contextStatusesService: ContextStatusesService,
        private favouritesService: FavouritesService,
        private loadingService: LoadingService,
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
                if (navigationEndEvent.urlAfterRedirects === '/favourites') {
                    this.contextStatusesService.setContextStatuses(this.statuses);
                }
            });

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {

            this.loadingService.showLoader();

            this.statuses = await this.favouritesService.list();
            this.statuses.context = ContextTimeline.favourites;

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }
}
