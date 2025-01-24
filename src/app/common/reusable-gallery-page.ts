import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ResponsiveComponent } from "./responsive";
import { filter, Subscription } from "rxjs";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { ContextStatusesService } from "../services/common/context-statuses.service";
import { LinkableResult } from "../models/linkable-result";
import { Status } from "../models/status";

@Component({
    selector: 'app-reusable-gallery-page',
    template: '',
    styles: [],
    standalone: false
})
export class ReusableGalleryPageComponent extends ResponsiveComponent implements OnInit, OnDestroy {
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected isPageVisible = signal(true);
    protected pageUrl = '';

    protected router = inject(Router);
    protected contextStatusesService = inject(ContextStatusesService);

    private routeNavigationEndSubscription?: Subscription;
    private routeNavigationStartSubscription?: Subscription;

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.pageUrl = this.router.routerState.snapshot.url.split('?')[0];

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                const navigationEndEvent = event as NavigationEnd;
                
                if (navigationEndEvent.urlAfterRedirects.startsWith(this.pageUrl)) {
                    this.contextStatusesService.setContextStatuses(this.statuses());
                    this.isPageVisible.set(true);
                }

                this.onRouteNavigationEnd(navigationEndEvent);
            });

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(async (event) => {
                const navigationStarEvent = event as NavigationStart;
                if (!navigationStarEvent.url.startsWith(this.pageUrl) && this.isPageVisible()) {
                    this.statuses.set(this.contextStatusesService.statuses);
                    this.isPageVisible.set(false);
                }

                this.onRouteNavigationStart(navigationStarEvent);
            });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeNavigationStartSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    onRouteNavigationStart(_navigationStarEvent: NavigationStart): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    onRouteNavigationEnd(_navigationEndEvent: NavigationEnd): void {
    }
}