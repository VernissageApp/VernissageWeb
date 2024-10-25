import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { Settings } from 'src/app/models/settings';
import { SettingsService } from 'src/app/services/http/settings.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
    animations: fadeInAnimation
})
export class SettingsPage extends ResponsiveComponent implements OnInit {
    isReady = false;
    settings?: Settings;
    webContactUser?: User;
    systemDefaultUser?: User;

    constructor(
        private authorizationService: AuthorizationService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private usersService: UsersService,
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

        if (this.settings.webContactUserId) {
            this.webContactUser = await this.usersService.profile(this.settings.webContactUserId);
        }

        if (this.settings.systemDefaultUserId) {
            this.systemDefaultUser = await this.usersService.profile(this.settings.systemDefaultUserId);
        }

        this.isReady = true;
        this.loadingService.hideLoader();
    }

    private isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }
}
