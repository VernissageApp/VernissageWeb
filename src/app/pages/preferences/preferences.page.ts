import { ChangeDetectionStrategy, Component, inject, model, OnInit, Renderer2, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';

@Component({
    selector: 'app-preferences',
    templateUrl: './preferences.page.html',
    styleUrls: ['./preferences.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    protected showCounts = model(true);
    protected showFavourites = model(false);
    protected showReblog = model(false);
    protected showAltIcon = model(false);
    protected alwaysShowSdrPhoto = model(false);
    protected autoScrollGalleryImages = model(false);

    private preferencesService = inject(PreferencesService);
    private routeReuseStrategy = inject(RouteReuseStrategy);
    private renderer = inject(Renderer2);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.isLightTheme.set(this.preferencesService.isLightTheme);
        this.isCircleAvatar.set(this.preferencesService.isCircleAvatar);
        this.isSquareImages.set(this.preferencesService.isSquareImages);
        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
        this.showAlternativeText.set(this.preferencesService.showAlternativeText);
        this.showAvatars.set(this.preferencesService.showAvatars);
        this.showCounts.set(this.preferencesService.showCounts);
        this.showFavourites.set(this.preferencesService.showFavourites);
        this.showReblog.set(this.preferencesService.showReblog);
        this.showAltIcon.set(this.preferencesService.showAltIcon);
        this.alwaysShowSdrPhoto.set(this.preferencesService.alwaysShowSdrPhoto);
        this.autoScrollGalleryImages.set(this.preferencesService.autoScrollGalleryImages);

        this.isReady.set(true);
    }

    protected onThemeChange(): void {
        this.preferencesService.isLightTheme = this.isLightTheme();
        this.preferencesService.applyTheme(this.renderer);
    }

    protected onAvatarChange(): void {
        this.preferencesService.isCircleAvatar = this.isCircleAvatar();
    }

    protected onSquareImageChange(): void {
        this.preferencesService.isSquareImages = this.isSquareImages();
    }

    protected onAlwaysShowNSFWChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.alwaysShowNSFW = this.alwaysShowNSFW();
    }

    protected onShowAlternativeTextChange(): void {
        this.preferencesService.showAlternativeText = this.showAlternativeText();
    }

    protected onShowAvatarsChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showAvatars = this.showAvatars();
    }

    protected onShowCountsChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showCounts = this.showCounts();
    }

    protected onShowFavouritesChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showFavourites = this.showFavourites();
    }

    protected onShowReblogChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showReblog = this.showReblog();
    }

    protected onShowAltIconChange(): void {
        this.clearReuseStrategyState();
        this.preferencesService.showAltIcon = this.showAltIcon();
    }

    protected onAlwaysShowSdrPhotoChange(): void {
        this.preferencesService.alwaysShowSdrPhoto = this.alwaysShowSdrPhoto();
    }

    protected onAutoScrollGalleryImagesChange(): void {
        this.preferencesService.autoScrollGalleryImages = this.autoScrollGalleryImages();
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        customReuseStrategy?.clear();
    }
}
