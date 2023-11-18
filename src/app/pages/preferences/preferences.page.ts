import { Component, Inject, Renderer2 } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { MessagesService } from 'src/app/services/common/messages.service';
import { EventType } from 'src/app/models/event-type';
import { LoadingService } from 'src/app/services/common/loading.service';
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
        private messageService: MessagesService,
        private loadingService: LoadingService,
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

        this.loadingService.showLoader();
        // this.settings = await this.settingsService.get();
        this.isReady = true;
        this.loadingService.hideLoader();
    }

    async onSubmit(): Promise<void> {
        try {
            if (this.preferences) {
                // await this.settingsService.put(this.settings);
                this.messageService.showSuccess('Settings was saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
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
}
