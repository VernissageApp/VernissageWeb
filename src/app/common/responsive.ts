import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { Subscription } from "rxjs";

export enum Resolution {
    handsetPortrait,
    handsetLandscape,
    tablet,
    browser
}

@Component({
    selector: 'app-base',
    template: '',
    styles: [],
    standalone: false
})
export class ResponsiveComponent implements OnInit, OnDestroy {
    private breakpointSubscription: Subscription;

    protected onHandsetPortrait?() : void;
    protected onHandsetLandscape?() : void;
    protected onTablet?() : void;
    protected onBrowser?() : void;

    protected deviceResolution = signal(Resolution.browser);
    protected isHandset = signal(false);
    protected isHandsetPortrait = signal(false);
    protected isHandsetLandscape = signal(false);

    private breakpointObserver = inject(BreakpointObserver);

    constructor() {
        this.breakpointSubscription = this.breakpointObserver
            .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
            .subscribe(() => {
                this.callFunction();
            });
    }

    ngOnInit(): void {
        this.callFunction();
    }

    ngOnDestroy(): void {
        this.breakpointSubscription?.unsubscribe();
    }

    private callFunction(): void {
        if (this.isHandsetPortraitLayout()) {
            this.deviceResolution.set(Resolution.handsetPortrait);
            this.isHandset.set(true);
            this.isHandsetPortrait.set(true);
            this.isHandsetLandscape.set(false);

            this.onHandsetPortrait?.();
        } else if (this.isHandsetLandscapeLayout()) {
            this.deviceResolution.set(Resolution.handsetLandscape);
            this.isHandset.set(true);
            this.isHandsetPortrait.set(false);
            this.isHandsetLandscape.set(true);

            this.onHandsetLandscape?.();
        } else if (this.isTabletLayout()) {
            this.deviceResolution.set(Resolution.tablet);
            this.isHandset.set(false);
            this.isHandsetPortrait.set(false);
            this.isHandsetLandscape.set(false);

            this.onTablet?.();
        } else {
            this.deviceResolution.set(Resolution.browser);
            this.isHandset.set(false);
            this.isHandsetPortrait.set(false);
            this.isHandsetLandscape.set(false);

            this.onBrowser?.();
        }
    }

    private isHandsetPortraitLayout(): boolean {
        // (max-width: 599.98px)
        return this.breakpointObserver.isMatched(Breakpoints.XSmall);
    }

    private isHandsetLandscapeLayout(): boolean {
        // (min-width: 600px) and (max-width: 959.98px)
        return this.breakpointObserver.isMatched(Breakpoints.Small);
    }

    private isTabletLayout(): boolean {
        // (min-width: 960px) and (max-width: 1279.98px)
        return this.breakpointObserver.isMatched(Breakpoints.Medium);
    }
}