import { Injectable, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScreenSizeService implements OnDestroy {

    private breakpointSubscription: Subscription;
    private handsetFunction: (() => void) | undefined;
    private tabletFunction: (() => void) | undefined;
    private browserFunction: (() => void) | undefined;

    constructor(private breakpointObserver: BreakpointObserver) {
        this.breakpointSubscription = this.breakpointObserver
            .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
            .subscribe(() => {
                if (this.isHandsetLayout() && this.handsetFunction) {
                    this.handsetFunction();
                } else if (this.isTabletLayout() && this.tabletFunction) {
                    this.tabletFunction();
                } else if (this.browserFunction) {
                    this.browserFunction();
                }
            });
    }

    ngOnDestroy(): void {
        this.handsetFunction = undefined;
        this.tabletFunction = undefined;
        this.browserFunction = undefined;

        if (this.breakpointSubscription) {
            this.breakpointSubscription.unsubscribe();
        }
    }

    public screenSizeChanged(
        handsetFunction: (() => void),
        tabletFunction: (() => void),
        browserFunction: (() => void)
    ): void {
        this.handsetFunction = handsetFunction;
        this.tabletFunction = tabletFunction;
        this.browserFunction = browserFunction;

        if (this.isHandsetLayout() && this.handsetFunction) {
            this.handsetFunction();
        } else if (this.isTabletLayout() && this.tabletFunction) {
            this.tabletFunction();
        } else if (this.browserFunction) {
            this.browserFunction();
        }
    }

    private isHandsetLayout(): boolean {
        return this.breakpointObserver.isMatched(Breakpoints.XSmall) || this.breakpointObserver.isMatched(Breakpoints.Small);
    }

    private isTabletLayout(): boolean {
        return this.breakpointObserver.isMatched(Breakpoints.Medium);
    }
}
