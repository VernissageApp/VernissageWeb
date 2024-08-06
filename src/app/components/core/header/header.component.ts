import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouteReuseStrategy, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User } from 'src/app/models/user';
import { InstanceService } from 'src/app/services/http/instance.service';
import { AuthorizationService } from '../../../services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Resolution, ResponsiveComponent } from 'src/app/common/responsive';
import { NotificationsService } from 'src/app/services/http/notifications.service';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';
import { SwPush } from '@angular/service-worker';
import { UserDisplayService } from 'src/app/services/common/user-display.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends ResponsiveComponent implements OnInit, OnDestroy {
    readonly resolution = Resolution;

    public notificationCounter = 0;
    public user?: User | null;
    public avatarUrl = "assets/avatar.svg";
    public fullName = '';
    public isLoggedIn = false;

    private userChangeSubscription?: Subscription;
    private notificationChangeSubscription?: Subscription;
    private messagesSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private instanceService: InstanceService,
        private notificationsService: NotificationsService,
        private userDisplayService: UserDisplayService,
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
        this.isLoggedIn = await this.authorizationService.isLoggedIn();
        this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';

        this.userChangeSubscription = this.authorizationService.changes.subscribe(async (user) => {
            this.user = user;
            this.isLoggedIn = await this.authorizationService.isLoggedIn();
            this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';
            this.fullName = this.userDisplayService.displayName(this.user);

            this.messagesSubscription = this.swPushService.messages.subscribe(async () => {
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
        this.messagesSubscription?.unsubscribe();
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
