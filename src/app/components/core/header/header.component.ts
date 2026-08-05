import { Component, OnInit, OnDestroy, Renderer2, signal, computed, ChangeDetectionStrategy, inject, NgZone, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, RouteReuseStrategy, Router, RouterLink } from '@angular/router';
import { filter, interval, Subscription } from 'rxjs';

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
import { UserPayload } from 'src/app/models/user-payload';
import { getLanguageFlag, LanguageService, SUPPORTED_HEADER_LANGUAGES } from 'src/app/services/common/language.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatBadge } from '@angular/material/badge';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ArticlesService } from 'src/app/services/http/articles.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatToolbar, MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, RouterLink, MatDivider, MatButton, MatBadge, NgOptimizedImage, TranslatePipe]
})
export class HeaderComponent extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly resolution = Resolution;
    protected notificationCounter = signal(0);
    protected articleCounter = signal(0);
    protected user = signal<UserPayload | undefined>(undefined);
    protected avatarUrl = computed(() => this.user()?.avatarUrl ?? 'assets/avatar.svg');
    protected fullName = computed(() => this.userDisplayService.displayName(this.user()));
    protected isLoggedIn = signal(false);
    protected showTrending = signal(false);
    protected showEditorsChoice = signal(false);
    protected showExplore = signal(false);
    protected showNews = signal(false);
    protected showSharedBusinessCards = signal(false);
    protected isLightTheme = signal(false);
    protected currentLanguage = signal('en-us');
    protected readonly languages = SUPPORTED_HEADER_LANGUAGES;

    private clearReuseStrategyAfterNavigationEnds = false;
    private userChangeSubscription?: Subscription;
    private notificationChangeSubscription?: Subscription;
    private articleChangeSubscription?: Subscription;
    private articleCountRefreshSubscription?: Subscription;
    private messagesSubscription?: Subscription;
    private routeNavigationEndSubscription?: Subscription;
    private languageChangeSubscription?: Subscription;
    private isLoadingArticleCount = false;
    private isArticleCountRefreshPending = false;
    private articleCounterVersion = 0;
    private readonly articleCountRefreshInterval = 5 * 60 * 1000;

    private authorizationService = inject(AuthorizationService);
    private instanceService = inject(InstanceService);
    private notificationsService = inject(NotificationsService);
    private articlesService = inject(ArticlesService);
    private settingsService = inject(SettingsService);
    private userDisplayService = inject(UserDisplayService);
    private routeReuseStrategy = inject(RouteReuseStrategy);
    private router = inject(Router);
    private swPushService = inject(SwPush);
    private preferencesService = inject(PreferencesService);
    private languageService = inject(LanguageService);
    private translateService = inject(TranslateService);
    private renderer = inject(Renderer2);
    private ngZone = inject(NgZone);
    private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const isLoggedInInternal = await this.authorizationService.isLoggedIn();
        const userInternal = this.authorizationService.getUser();

        this.isLightTheme.set(this.preferencesService.isLightTheme);
        this.currentLanguage.set(this.languageService.getCurrentLanguage());
        this.user.set(userInternal);
        this.isLoggedIn.set(isLoggedInInternal);

        this.languageChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.currentLanguage.set(this.languageService.getCurrentLanguage());
            this.articleCounterVersion++;
            void this.loadArticleCount();
        });

        this.userChangeSubscription = this.authorizationService.changes.subscribe(async (user) => {
            this.user.set(user);

            const isLoggedInInternal = await this.authorizationService.isLoggedIn();
            this.isLoggedIn.set(isLoggedInInternal);

            this.showTrending.set(isLoggedInInternal || (this.settingsService.publicSettings?.showTrendingForAnonymous ?? false));
            this.showEditorsChoice.set(isLoggedInInternal || ((this.settingsService.publicSettings?.showEditorsChoiceForAnonymous ?? false) || (this.settingsService.publicSettings?.showEditorsUsersChoiceForAnonymous ?? false)));
            this.showExplore.set(isLoggedInInternal
                || (this.settingsService.publicSettings?.showCategoriesForAnonymous ?? false)
                || (this.settingsService.publicSettings?.showCamerasForAnonymous ?? false)
                || (this.settingsService.publicSettings?.showLensesForAnonymous ?? false)
                || (this.settingsService.publicSettings?.showFilmsForAnonymous ?? false));
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
            await this.loadArticleCount();
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

        this.articleChangeSubscription = this.articlesService.changes.subscribe((count) => {
            this.articleCounterVersion++;
            this.articleCounter.set(count);
        });

        if (this.isBrowser) {
            // A recurring task created inside Angular's zone prevents ApplicationRef from
            // becoming stable. During hydration RouterScroller waits for that stability
            // before it starts emitting scroll restoration events.
            this.ngZone.runOutsideAngular(() => {
                this.articleCountRefreshSubscription = interval(this.articleCountRefreshInterval).subscribe(() => {
                    this.ngZone.run(() => void this.loadArticleCount());
                });
            });
        }
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.userChangeSubscription?.unsubscribe();
        this.notificationChangeSubscription?.unsubscribe();
        this.articleChangeSubscription?.unsubscribe();
        this.articleCountRefreshSubscription?.unsubscribe();
        this.messagesSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
        this.languageChangeSubscription?.unsubscribe();
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

    protected async onLanguageChange(language: string): Promise<void> {
        await this.languageService.setLanguageFromLocale(language);
        this.currentLanguage.set(language);
    }

    protected getLanguageFlag(language: string): string {
        return getLanguageFlag(language);
    }

    protected onUserMenuClosed(): void {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement) {
            activeElement.blur();
        }
    }

    private async loadNotificationCount(): Promise<void> {
        if (!this.isBrowser) {
            return;
        }

        try {
            if (this.user()) {
                const notificationCount = await this.notificationsService.count();
                this.notificationCounter.set(notificationCount.amount);
            }
        } catch(error) {
            console.error(error);
        }
    }

    private async loadArticleCount(): Promise<void> {
        if (!this.isBrowser) {
            return;
        }

        const userId = this.user()?.id;
        if (!userId || !this.showNews()) {
            this.articleCounterVersion++;
            this.articleCounter.set(0);
            return;
        }

        if (this.isLoadingArticleCount) {
            this.isArticleCountRefreshPending = true;
            return;
        }

        this.isLoadingArticleCount = true;
        const articleCounterVersion = this.articleCounterVersion;
        const articleLanguage = this.getArticleLanguage();

        try {
            const articleCount = await this.articlesService.count(articleLanguage);
            if (this.user()?.id === userId && this.getArticleLanguage() === articleLanguage && this.articleCounterVersion === articleCounterVersion) {
                this.articleCounter.set(articleCount.amount);
            }
        } catch(error) {
            console.error(error);
        } finally {
            this.isLoadingArticleCount = false;

            if (this.isArticleCountRefreshPending) {
                this.isArticleCountRefreshPending = false;
                void this.loadArticleCount();
            }
        }
    }

    private getArticleLanguage(): string {
        return this.languageService.getCurrentLanguageLocale().replace('-', '_');
    }

    private clearReuseStrategyState(): void {
        const customReuseStrategy = this.routeReuseStrategy as CustomReuseStrategy;
        if (customReuseStrategy) {
            customReuseStrategy.clear();
        }
    }
}
