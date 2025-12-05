import { Component, OnInit, OnDestroy, HostListener, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { SettingsService } from 'src/app/services/http/settings.service';
import { ReusableGalleryPageComponent } from 'src/app/common/reusable-gallery-page';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { ArticlesService } from 'src/app/services/http/articles.service';
import { Article } from 'src/app/models/article';

@Component({
    selector: 'app-home-signout',
    templateUrl: './home-signout.component.html',
    styleUrls: ['./home-signout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeSignoutComponent extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected showLocal = signal(true);
    protected showEditorsChoice = signal(false);
    protected mastodonUrl = signal<string | undefined>(undefined);
    protected articles = signal<Article[]>([]);
    
    private lastRefreshTime = new Date();
    private routeParamsSubscription?: Subscription;

    private timelineService = inject(TimelineService);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private activatedRoute = inject(ActivatedRoute);
    private articlesService = inject(ArticlesService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const internalMastodonUrl = this.settingsService.publicSettings?.mastodonUrl ?? '';
        if (internalMastodonUrl.length > 0) {
            this.mastodonUrl.set(internalMastodonUrl);
        }

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {
            this.loadingService.showLoader();
            await Promise.all([
                this.loadData(),
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

                await Promise.all([
                    this.loadData(),
                    this.loadArticles()
                ]);

                this.loadingService.hideLoader();
            }
        }
    }

    private async loadData(): Promise<void> {
        this.showLocal.set(this.settingsService.publicSettings?.showLocalTimelineForAnonymous ?? false);
        this.showEditorsChoice.set(this.settingsService.publicSettings?.showEditorsChoiceForAnonymous ?? false);
        
        if (this.settingsService.publicSettings?.showLocalTimelineForAnonymous) {
            this.lastRefreshTime = new Date();
            const statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
            statuses.context = ContextTimeline.local;

            this.statuses.set(statuses);
        } else if (this.showEditorsChoice()) {
            this.lastRefreshTime = new Date();
            const statuses = await this.timelineService.featuredStatuses(undefined, undefined, undefined, undefined);
            statuses.context = ContextTimeline.editors;

            this.statuses.set(statuses);
        }
    }

    private async loadArticles(): Promise<void> {
        const articlesPage = 1;
        const articlesSize = 10;

        const internalArticles = await this.articlesService.all(articlesPage, articlesSize, ArticleVisibility.SignOutHome, false);
        this.articles.set(internalArticles.data);
    }
}
