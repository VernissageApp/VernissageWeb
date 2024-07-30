import { Component, Inject, Renderer2 } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { EventType } from 'src/app/models/event-type';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';
import { WindowService } from 'src/app/services/common/window.service';

@Component({
    selector: 'app-preferences',
    templateUrl: './preferences.page.html',
    styleUrls: ['./preferences.page.scss'],
    animations: fadeInAnimation
})
export class PreferencesPage extends Responsive {
    isReady = false;
    preferences: string[] = [];
    eventTypes = Object.values(EventType);

    isLightTheme = true;
    isCircleAvatar = true;
    isSquareImages = true;

    alwaysShowNSFW = false;
    showAlternativeText = false;
    showAvatars = false;
    showFavourites = false;
    showAltIcon = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private preferencesService: PreferencesService,
        private routeReuseStrategy: RouteReuseStrategy,
        private renderer: Renderer2,
        private windowService: WindowService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.isLightTheme = this.preferencesService.isLightTheme;
        this.isCircleAvatar = this.preferencesService.isCircleAvatar;
        this.isSquareImages = this.preferencesService.isSquareImages;
        this.alwaysShowNSFW = this.preferencesService.alwaysShowNSFW;
        this.showAlternativeText = this.preferencesService.showAlternativeText;
        this.showAvatars = this.preferencesService.showAvatars;
        this.showFavourites = this.preferencesService.showFavourites;
        this.showAltIcon = this.preferencesService.showAltIcon;

        this.isReady = true;
    }

    onThemeChange(): void {
        this.preferencesService.isLightTheme = this.isLightTheme;

        if (this.isLightTheme) {
            this.renderer.removeClass(this.document.body, 'dark-theme');
            this.windowService.nativeWindow.document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#fafafa");
        } else {
            this.renderer.addClass(this.document.body, 'dark-theme');
            this.windowService.nativeWindow.document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#303030");
        }
    }

    onAvatarChange(): void {
        this.preferencesService.isCircleAvatar = this.isCircleAvatar;
    }

    onSquareImageChange(): void {
        this.preferencesService.isSquareImages = this.isSquareImages;
    }

    onAlwaysShowNSFWChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.alwaysShowNSFW = this.alwaysShowNSFW;
    }

    onShowAlternativeTextChange(): void {
        this.preferencesService.showAlternativeText = this.showAlternativeText;
    }

    onShowAvatarsChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showAvatars = this.showAvatars;
    }

    onShowFavouritesChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showFavourites = this.showFavourites;
    }

    onShowAltIconChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showAltIcon = this.showAltIcon;
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        customReuseStrategy?.clear();
    }
}
