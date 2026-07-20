import { ViewportScroller } from "@angular/common";
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
    styles: []
})
export class ReusableGalleryPageComponent extends ResponsiveComponent implements OnInit, OnDestroy {
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected isPageVisible = true;
    protected pageUrl = '';

    protected router = inject(Router);
    protected contextStatusesService = inject(ContextStatusesService);

    private routeNavigationEndSubscription?: Subscription;
    private routeNavigationStartSubscription?: Subscription;
    private scrollPosition?: [number, number];
    private shouldRestoreScrollPosition = false;

    private viewportScroller = inject(ViewportScroller);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.pageUrl = this.router.routerState.snapshot.url.split('?')[0];

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                const navigationEndEvent = event as NavigationEnd;
                
                if (navigationEndEvent.urlAfterRedirects.startsWith(this.pageUrl)) {
                    this.contextStatusesService.setContextStatuses(this.statuses());
                    this.isPageVisible = true;

                    if (this.shouldRestoreScrollPosition && this.scrollPosition) {
                        this.restoreScrollPosition(this.scrollPosition);
                        this.shouldRestoreScrollPosition = false;
                    }
                }

                this.onRouteNavigationEnd(navigationEndEvent);
            });

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(async (event) => {
                const navigationStarEvent = event as NavigationStart;

                this.shouldRestoreScrollPosition = navigationStarEvent.url.startsWith(this.pageUrl)
                    && navigationStarEvent.navigationTrigger === 'popstate'
                    && this.scrollPosition !== undefined;

                if (!navigationStarEvent.url.startsWith(this.pageUrl) && this.isPageVisible) {
                    this.scrollPosition = this.viewportScroller.getScrollPosition();
                    this.statuses.set(this.contextStatusesService.statuses);
                    this.isPageVisible = false;
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

    private restoreScrollPosition(position: [number, number]): void {
        this.viewportScroller.scrollToPosition(position);

        if (typeof requestAnimationFrame === 'undefined') {
            return;
        }

        // Reattaching the responsive gallery triggers another layout pass on mobile.
        // Repeat after two frames so browser scroll anchoring cannot move the viewport again.
        requestAnimationFrame(() => {
            if (!this.isPageVisible) {
                return;
            }

            this.viewportScroller.scrollToPosition(position);
            requestAnimationFrame(() => {
                if (this.isPageVisible) {
                    this.viewportScroller.scrollToPosition(position);
                }
            });
        });
    }
}
