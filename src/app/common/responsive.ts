import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, OnDestroy, OnInit } from "@angular/core";
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
    styles: []
})
export class Responsive implements OnInit, OnDestroy {
    private breakpointSubscription: Subscription;

    protected onHandsetPortrait?() : void;
    protected onHandsetLandscape?() : void;
    protected onTablet?() : void;
    protected onBrowser?() : void;

    protected deviceResolution = Resolution.browser;
    protected isHandset = false;
    protected isHandsetPortrait = false;
    protected isHandsetLandscape = false;

    constructor(private breakpointObserver: BreakpointObserver) {
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
            this.deviceResolution = Resolution.handsetPortrait;
            this.isHandset = true;
            this.isHandsetPortrait = true;
            this.isHandsetLandscape = false;

            this.onHandsetPortrait?.();
        } else if (this.isHandsetLandscapeLayout()) {
            this.deviceResolution = Resolution.handsetLandscape;
            this.isHandset = true;
            this.isHandsetPortrait = false;
            this.isHandsetLandscape = true;

            this.onHandsetLandscape?.();
        } else if (this.isTabletLayout()) {
            this.deviceResolution = Resolution.tablet;
            this.isHandset = false;
            this.isHandsetPortrait = false;
            this.isHandsetLandscape = false;

            this.onTablet?.();
        } else {
            this.deviceResolution = Resolution.browser;
            this.isHandset = false;
            this.isHandsetPortrait = false;
            this.isHandsetLandscape = false;

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