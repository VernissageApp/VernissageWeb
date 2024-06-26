import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouteReuseStrategy, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User } from 'src/app/models/user';
import { InstanceService } from 'src/app/services/http/instance.service';
import { AuthorizationService } from '../../../services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Resolution, Responsive } from 'src/app/common/responsive';
import { NotificationsService } from 'src/app/services/http/notifications.service';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';
import { SwPush } from '@angular/service-worker';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends Responsive {
    readonly resolution = Resolution;

    public notificationCounter = 0;
    public user?: User | null;
    public avatarUrl = "assets/avatar.svg";
    public fullName = '';
    private userChangeSubscription?: Subscription;
    private notificationChangeSubscription?: Subscription;
    private meesagesSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private instanceService: InstanceService,
        private notificationsService: NotificationsService,
        private routeReuseStrategy: RouteReuseStrategy,
        private router: Router,
        private swPushService: SwPush,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver)
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.user = this.authorizationService.getUser();
        this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';

        this.userChangeSubscription = this.authorizationService.changes.subscribe(async (user) => {
            this.user = user;
            this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';

            this.fullName = this.user?.userName ?? '';
            if (this.user?.name && this.user.name.length > 0) {
                this.fullName = this.user.name
            }

            this.meesagesSubscription = this.swPushService.messages.subscribe(async (a) => {
                await this.loadNotificationCount();
            });

            await this.loadNotificationCount();
            this.clearReuseStrategyState();
        });

        this.notificationChangeSubscription = this.notificationsService.changes.subscribe(async (count) => {
            this.notificationCounter = count;
            this.notificationsService.setApplicationBadge(count);
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.userChangeSubscription?.unsubscribe();
        this.notificationChangeSubscription?.unsubscribe();
        this.meesagesSubscription?.unsubscribe();
    }

    async signOut(): Promise<void> {
        this.clearReuseStrategyState();
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

    private async loadNotificationCount(): Promise<void> {
        try {
            if (this.user) {
                const notificationCount = await this.notificationsService.count();
                this.notificationCounter = notificationCount.amount;
            }
        } catch(error) {
            console.error(error);
        }
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        if (customReuseStrategy) {
            customReuseStrategy.clear();
        }
    }
}
