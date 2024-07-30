import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { Settings } from 'src/app/models/settings';
import { SettingsService } from 'src/app/services/http/settings.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { EventType } from 'src/app/models/event-type';
import { LoadingService } from 'src/app/services/common/loading.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
    animations: fadeInAnimation
})
export class SettingsPage extends Responsive {
    isReady = false;
    settings?: Settings;

    constructor(
        private authorizationService: AuthorizationService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        if (!this.isAdministrator()) {
            throw new ForbiddenError();
        }

        this.loadingService.showLoader();
        this.settings = await this.settingsService.get();
        this.isReady = true;
        this.loadingService.hideLoader();
    }

    private isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }
}
