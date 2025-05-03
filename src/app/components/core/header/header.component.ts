import { Component, OnInit, OnDestroy, Renderer2, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { NavigationEnd, RouteReuseStrategy, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { User } from 'src/app/models/user';
import { InstanceService } from 'src/app/services/http/instance.service';
import { AuthorizationService } from '../../../services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { Resolution, ResponsiveComponent } from 'src/app/common/responsive';
import { NotificationsService } from 'src/app/services/http/notifications.service';
import { CustomReuseStrategy } from 'src/app/common/custom-reuse-strategy';
import { SwPush } from '@angular/service-worker';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HeaderComponent extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly resolution = Resolution;
    protected notificationCounter = signal(0);
    protected user = signal<User | undefined>(undefined);
    protected avatarUrl = computed(() => this.user()?.avatarUrl ?? 'assets/avatar.svg');
    protected fullName = computed(() => this.userDisplayService.displayName(this.user()));
    protected isLoggedIn = signal(false);
    protected showTrending = signal(false);
    protected showEditorsChoice = signal(false);
    protected showCategories = signal(false);
    protected showNews = signal(false);
    protected showSharedBusinessCards = signal(false);
    protected isLightTheme = signal(false);

    private clearReuseStrategyAfterNavigationEnds = false;
    private userChangeSubscription?: Subscription;
    private notificationChangeSubscription?: Subscription;
    private messagesSubscription?: Subscription;
    private routeNavigationEndSubscription?: Subscription;

    private authorizationService = inject(AuthorizationService);
    private instanceService = inject(InstanceService);
    private notificationsService = inject(NotificationsService);
    private settingsService = inject(SettingsService);
    private userDisplayService = inject(UserDisplayService);
    private routeReuseStrategy = inject(RouteReuseStrategy);
    private router = inject(Router);
    private swPushService = inject(SwPush);
    private preferencesService = inject(PreferencesService);
    private renderer = inject(Renderer2);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const isLoggedInInternal = await this.authorizationService.isLoggedIn();
        const userInternal = this.authorizationService.getUser();

        this.isLightTheme.set(this.preferencesService.isLightTheme);
        this.user.set(userInternal);
        this.isLoggedIn.set(isLoggedInInternal);

        this.userChangeSubscription = this.authorizationService.changes.subscribe(async (user) => {
            this.user.set(user);

            const isLoggedInInternal = await this.authorizationService.isLoggedIn();
            this.isLoggedIn.set(isLoggedInInternal);

            this.showTrending.set(isLoggedInInternal || (this.settingsService.publicSettings?.showTrendingForAnonymous ?? false));
            this.showEditorsChoice.set(isLoggedInInternal || ((this.settingsService.publicSettings?.showEditorsChoiceForAnonymous ?? false) || (this.settingsService.publicSettings?.showEditorsUsersChoiceForAnonymous ?? false)));
            this.showCategories.set(isLoggedInInternal || (this.settingsService.publicSettings?.showCategoriesForAnonymous ?? false));
            this.showSharedBusinessCards.set(this.settingsService.publicSettings?.showSharedBusinessCards ?? false);

            this.showNews.set(false);
            const showNewsForAnonymous = this.settingsService.publicSettings?.showNewsForAnonymous ?? false;
            if (!isLoggedInInternal && showNewsForAnonymous) {
                this.showNews.set(true);
            }
    
            const showNews = this.settingsService.publicSettings?.showNews ?? false;
            if (isLoggedInInternal && showNews) {
                this.showNews.set(true);
            }

            this.messagesSubscription = this.swPushService.messages.subscribe(async () => {
                await this.loadNotificationCount();
            });

            await this.loadNotificationCount();
            this.clearReuseStrategyState();
        });

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async () => {
                if (this.clearReuseStrategyAfterNavigationEnds) {
                    this.clearReuseStrategyState();
                    this.clearReuseStrategyAfterNavigationEnds = false;
                }
            });

        this.notificationChangeSubscription = this.notificationsService.changes.subscribe(async (count) => {
            this.notificationCounter.set(count);
            this.notificationsService.setApplicationBadge(count);
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.userChangeSubscription?.unsubscribe();
        this.notificationChangeSubscription?.unsubscribe();
        this.messagesSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    protected async signOut(): Promise<void> {
        this.clearReuseStrategyState();
        await this.authorizationService.signOut();
        await this.router.navigate(['/login']);
    }

    protected markClearReuseStrategy(): void {
        this.clearReuseStrategyAfterNavigationEnds = true;
    }

    protected isRegistrationEnabled(): boolean {
        return this.instanceService.isRegistrationEnabled();
    }

    protected isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    protected isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }

    protected isRegistrationByInvitationsOpened(): boolean {
        return this.instanceService.instance?.registrationOpened === false && this.instanceService.instance?.registrationByInvitationsOpened === true;
    }

    protected onThemeToggle(): void {
        this.preferencesService.toggleTheme(this.renderer);
        this.isLightTheme.set(this.preferencesService.isLightTheme);
    }

    private async loadNotificationCount(): Promise<void> {
        try {
            if (this.user()) {
                const notificationCount = await this.notificationsService.count();
                this.notificationCounter.set(notificationCount.amount);
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
