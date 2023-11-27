import { Component, Inject, Renderer2 } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { MessagesService } from 'src/app/services/common/messages.service';
import { EventType } from 'src/app/models/event-type';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { PreferencesService } from 'src/app/services/common/preferences.service';

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

    alwaysShowNSFW = false;
    showAlternativeText = false;
    showAvatars = false;
    showFavourites = false;
    showAltIcon = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private preferencesService: PreferencesService,
        private renderer: Renderer2,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.isLightTheme = this.preferencesService.isLightTheme;
        this.isCircleAvatar = this.preferencesService.isCircleAvatar;
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
        } else {
            this.renderer.addClass(this.document.body, 'dark-theme');
        }
    }

    onAvatarChange(): void {
        this.preferencesService.isCircleAvatar = this.isCircleAvatar;
    }

    onAlwaysShowNSFWChange(): void {
        this.preferencesService.alwaysShowNSFW = this.alwaysShowNSFW;
    }

    onShowAlternativeTextChange(): void {
        this.preferencesService.showAlternativeText = this.showAlternativeText;
    }

    onShowAvatarsChange(): void {
        this.preferencesService.showAvatars = this.showAvatars;
    }

    onShowFavouritesChange(): void {
        this.preferencesService.showFavourites = this.showFavourites;
    }

    onShowAltIconChange(): void {
        this.preferencesService.showAltIcon = this.showAltIcon;
    }
}
