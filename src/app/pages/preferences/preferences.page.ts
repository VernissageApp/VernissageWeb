import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { MessagesService } from 'src/app/services/common/messages.service';
import { EventType } from 'src/app/models/event-type';
import { LoadingService } from 'src/app/services/common/loading.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';

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

    theme = '1';
    avatar = '1';
    alwaysShowNSFW = false;
    showAlternativeText = false;
    showAvatars = false;
    showFavourites = false;
    showAltIcon = false;

    constructor(
        private messageService: MessagesService,
        private loadingService: LoadingService,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

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
}
