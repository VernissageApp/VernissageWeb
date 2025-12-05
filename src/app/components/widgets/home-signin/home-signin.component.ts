import { Component, OnInit, OnDestroy, HostListener, signal, model, ChangeDetectionStrategy, inject } from '@angular/core';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { SettingsService } from 'src/app/services/http/settings.service';
import { ReusableGalleryPageComponent } from 'src/app/common/reusable-gallery-page';
import { ArticlesService } from 'src/app/services/http/articles.service';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { Article } from 'src/app/models/article';
import { MessagesService } from 'src/app/services/common/messages.service';
import { FocusTrackerService } from 'src/app/services/common/focus-tracker.service';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';

@Component({
    selector: 'app-home-signin',
    templateUrl: './home-signin.component.html',
    styleUrls: ['./home-signin.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeSigninComponent extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected timeline = model('private');
    protected isReady = signal(false);
    protected isLoggedIn = signal(false);
    protected articles = signal<Article[]>([]);
    
    private lastRefreshTime = new Date();
    private routeParamsSubscription?: Subscription;

    private authorizationService = inject(AuthorizationService);
    private timelineService = inject(TimelineService);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private activatedRoute = inject(ActivatedRoute);
    private articlesService = inject(ArticlesService);
    private messagesService = inject(MessagesService);
    private focusTrackerService = inject(FocusTrackerService);
    private randomGeneratorService = inject(RandomGeneratorService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            if (!this.hasAccessToLocalTimeline()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();

            const pageType = params['t'] as string;
            await Promise.all([
                this.loadData(pageType),
                this.loadArticles()
            ]);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }

    @HostListener('document:visibilitychange', ['$event'])
    async visibilityChange(event: any): Promise<void> {
        if (!event.target.hidden && this.isPageVisible) {
            const twoHours = 60000 * 120;
            const lastRefreshTimePlusTwoHours = new Date(this.lastRefreshTime.getTime() + twoHours);
            const currentTime = new Date();

            if (lastRefreshTimePlusTwoHours < currentTime) {
                this.loadingService.showLoader();

                // This event is triggered after two hours of inactivity. At this point, 
                // the access token is considered expired, so it’s recommended to refresh it.
                await this.authorizationService.refreshAccessToken();

                await Promise.all([
                    await this.loadData(this.timeline()),
                    await this.loadArticles()
                ]);

                this.loadingService.hideLoader();
            }
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (this.focusTrackerService.isCurrentlyFocused || event.repeat || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        switch (event.key) {
            case '1':
                this.router.navigate(['/home'], { queryParams: { t: 'private' } });
                break;
            case '2':
                this.router.navigate(['/home'], { queryParams: { t: 'local' } });
                break;
            case '3':
                this.router.navigate(['/home'], { queryParams: { t: 'global' } });
                break;
        }
    }

    protected onTimelineRefresh(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { f: this.randomGeneratorService.generateString(8) },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected onTimelineChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                t: this.timeline()
            },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected async onDismissArticle(article: Article): Promise<void> {
        try {
            if (article.id) {
                await this.articlesService.dismiss(article.id);
                await this.loadArticles();
            }
        } catch (error) {
            console.error(error);
            this.messagesService.showServerError(error);
        }
    }

    private async loadData(pageType: string): Promise<void> {
        const isLoggedInInternal = await this.authorizationService.isLoggedIn();
        this.isLoggedIn.set(isLoggedInInternal);

        this.lastRefreshTime = new Date();

        switch(pageType) {
            case 'local': {
                this.timeline.set('local');
                const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                statuses.context = ContextTimeline.local;

                this.statuses.set(statuses);
                break;
            }
            case 'global': {
                this.timeline.set('global');
                const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, false);
                statuses.context = ContextTimeline.global;

                this.statuses.set(statuses);
                break;
            }
            default:
                if (this.isLoggedIn()) {
                    this.timeline.set('private');
                    const statuses = await this.timelineService.home();
                    statuses.context = ContextTimeline.home;

                    this.statuses.set(statuses);
                } else {
                    this.timeline.set('local');
                    const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                    statuses.context = ContextTimeline.local;

                    this.statuses.set(statuses);
                }
                break;
        }
    }

    private async loadArticles(): Promise<void> {
        const articlesPage = 1;
        const articlesSize = 10;

        const internalArticles = await this.articlesService.all(articlesPage, articlesSize, ArticleVisibility.SignInHome, false);
        this.articles.set(internalArticles.data);
    }

    private hasAccessToLocalTimeline(): boolean {
        if (this.authorizationService.getUser()) {
            return true;
        }

        if (this.settingsService.publicSettings?.showLocalTimelineForAnonymous) {
            return true;
        }

        return false;
    }
}
