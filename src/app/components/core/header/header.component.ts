import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User } from 'src/app/models/user';
import { InstanceService } from 'src/app/services/http/instance.service';
import { AuthorizationService } from '../../../services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Resolution, Responsive } from 'src/app/common/responsive';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends Responsive {
    readonly resolution = Resolution;

    public user?: User | null;
    public avatarUrl = "assets/avatar.svg";
    private userChangeSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private instanceService: InstanceService,
        private router: Router,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver)
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.user = this.authorizationService.getUser();
        this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';

        this.userChangeSubscription = this.authorizationService.changes.subscribe(user => {
            this.user = user;
            this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.userChangeSubscription?.unsubscribe();
    }

    async signOut(): Promise<void> {
        await this.authorizationService.signOut();
        await this.router.navigate(['/login']);
    }

    isRegistrationEnabled(): boolean {
        return this.instanceService.isRegistrationEnabled();
    }

    isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }

    isRegistrationByInvitationsOpened(): boolean {
        return this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByInvitationsOpened === true;
    }
}
