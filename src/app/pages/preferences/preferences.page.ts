import { Component, model, OnInit, Renderer2, signal } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';

@Component({
    selector: 'app-preferences',
    templateUrl: './preferences.page.html',
    styleUrls: ['./preferences.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class PreferencesPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);

    protected isLightTheme = model(true);
    protected isCircleAvatar = model(true);
    protected isSquareImages = model(true);
    protected alwaysShowNSFW = model(false);
    protected showAlternativeText = model(false);
    protected showAvatars = model(false);
    protected showFavourites = model(false);
    protected showAltIcon = model(false);
    protected alwaysShowSdrPhoto = model(false);

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

        this.isLightTheme.set(this.preferencesService.isLightTheme);
        this.isCircleAvatar.set(this.preferencesService.isCircleAvatar);
        this.isSquareImages.set(this.preferencesService.isSquareImages);
        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
        this.showAlternativeText.set(this.preferencesService.showAlternativeText);
        this.showAvatars.set(this.preferencesService.showAvatars);
        this.showFavourites.set(this.preferencesService.showFavourites);
        this.showAltIcon.set(this.preferencesService.showAltIcon);
        this.alwaysShowSdrPhoto.set(this.preferencesService.alwaysShowSdrPhoto);

        this.isReady.set(true);
    }

    onThemeChange(): void {
        this.preferencesService.isLightTheme = this.isLightTheme();
        this.preferencesService.applyTheme(this.renderer);
    }

    onAvatarChange(): void {
        this.preferencesService.isCircleAvatar = this.isCircleAvatar();
    }

    onSquareImageChange(): void {
        this.preferencesService.isSquareImages = this.isSquareImages();
    }

    onAlwaysShowNSFWChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.alwaysShowNSFW = this.alwaysShowNSFW();
    }

    onShowAlternativeTextChange(): void {
        this.preferencesService.showAlternativeText = this.showAlternativeText();
    }

    onShowAvatarsChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showAvatars = this.showAvatars();
    }

    onShowFavouritesChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showFavourites = this.showFavourites();
    }

    onShowAltIconChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showAltIcon = this.showAltIcon();
    }

    onAlwaysShowSdrPhotoChange(): void {
        this.preferencesService.alwaysShowSdrPhoto = this.alwaysShowSdrPhoto();
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        customReuseStrategy?.clear();
    }
}
