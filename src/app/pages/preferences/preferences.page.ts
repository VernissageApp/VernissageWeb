import { Component, Inject, Renderer2 } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { MessagesService } from 'src/app/services/common/messages.service';
import { EventType } from 'src/app/models/event-type';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { PersistanceService } from 'src/app/services/persistance/persistance.service';

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
        private persistanceService: PersistanceService,
        private renderer: Renderer2,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const theme = this.persistanceService.get('theme');
        if (theme === 'dark') {
            this.isLightTheme = false;
        }

        const avatar = this.persistanceService.get('avatar');
        if (avatar === 'rounded') {
            this.isCircleAvatar = false;
        }

        const alwaysShowNSFWString = this.persistanceService.get('alwaysShowNSFW');
        if (alwaysShowNSFWString === 'true') {
            this.alwaysShowNSFW = true;
        }

        const showAlternativeTextString = this.persistanceService.get('showAlternativeText');
        if (showAlternativeTextString === 'true') {
            this.showAlternativeText = true;
        }

        this.isReady = true;
    }

    onThemeChange(): void {
        if (this.isLightTheme) {
            this.renderer.removeClass(this.document.body, 'dark-theme');
            this.persistanceService.set('theme', 'light');
        } else {
            this.renderer.addClass(this.document.body, 'dark-theme');
            this.persistanceService.set('theme', 'dark');
        }
    }

    onAvatarChange(): void {
        if (this.isCircleAvatar) {
            this.persistanceService.set('avatar', 'circle');
        } else {
            this.persistanceService.set('avatar', 'rounded');
        }
    }

    onAlwaysShowNSFWChange(): void {
        if (this.alwaysShowNSFW) {
            this.persistanceService.set('alwaysShowNSFW', 'true');
        } else {
            this.persistanceService.set('alwaysShowNSFW', 'false');
        }
    }

    onShowAlternativeTextChange(): void {
        if (this.showAlternativeText) {
            this.persistanceService.set('showAlternativeText', 'true');
        } else {
            this.persistanceService.set('showAlternativeText', 'false');
        }
    }
}
