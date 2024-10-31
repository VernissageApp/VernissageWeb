import { Component, OnInit, Renderer2 } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { EventType } from 'src/app/models/event-type';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';

@Component({
    selector: 'app-preferences',
    templateUrl: './preferences.page.html',
    styleUrls: ['./preferences.page.scss'],
    animations: fadeInAnimation
})
export class PreferencesPage extends ResponsiveComponent implements OnInit {
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
    alwaysShowSdrPhoto = false;

    constructor(
        private preferencesService: PreferencesService,
        private routeReuseStrategy: RouteReuseStrategy,
        private renderer: Renderer2,
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
        this.alwaysShowSdrPhoto = this.preferencesService.alwaysShowSdrPhoto;

        this.isReady = true;
    }

    onThemeChange(): void {
        this.preferencesService.isLightTheme = this.isLightTheme;
        this.preferencesService.applyTheme(this.renderer);
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

    onAlwaysShowSdrPhotoChange(): void {
        this.preferencesService.alwaysShowSdrPhoto = this.alwaysShowSdrPhoto;
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        customReuseStrategy?.clear();
    }
}
