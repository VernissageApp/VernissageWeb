import { Component, OnInit, signal } from '@angular/core';
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
    animations: fadeInAnimation,
    standalone: false
})
export class SettingsPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);
    protected settings = signal<Settings | undefined>(undefined);
    protected webContactUser = signal<User | undefined>(undefined);
    protected systemDefaultUser = signal<User | undefined>(undefined);

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
        const downloadedSettings = await this.settingsService.get();
        this.settings.set(downloadedSettings);

        if (downloadedSettings.webContactUserId) {
            const downloadedContactUser = await this.usersService.profile(downloadedSettings.webContactUserId);
            this.webContactUser.set(downloadedContactUser);
        }

        if (downloadedSettings.systemDefaultUserId) {
            const downloadedSystemDefaultUser = await this.usersService.profile(downloadedSettings.systemDefaultUserId);
            this.systemDefaultUser.set(downloadedSystemDefaultUser);
        }

        this.isReady.set(true);
        this.loadingService.hideLoader();
    }

    private isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }
}
