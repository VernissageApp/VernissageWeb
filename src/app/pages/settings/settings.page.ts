import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { Settings } from 'src/app/models/settings';
import { SettingsService } from 'src/app/services/http/settings.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SettingsPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);
    protected settings = signal<Settings | undefined>(undefined);
    protected webContactUser = signal<User | undefined>(undefined);
    protected systemDefaultUser = signal<User | undefined>(undefined);

    private authorizationService = inject(AuthorizationService);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private usersService = inject(UsersService);

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
