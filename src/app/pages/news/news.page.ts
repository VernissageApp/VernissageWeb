import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PagedResult } from 'src/app/models/paged-result';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArticlesService } from 'src/app/services/http/articles.service';
import { Article } from 'src/app/models/article';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { SettingsService } from 'src/app/services/http/settings.service';
import { ForbiddenError } from 'src/app/errors/forbidden-error';

@Component({
    selector: 'app-news',
    templateUrl: './news.page.html',
    styleUrls: ['./news.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NewsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected articleVisibility = ArticleVisibility;

    protected isReady = signal(false);
    protected articles = signal<PagedResult<Article> | undefined>(undefined);
    protected pageIndex = signal(0);

    private routeParamsSubscription?: Subscription;
    
    constructor(
        private articlesService: ArticlesService,
        private loadingService: LoadingService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private settingsService: SettingsService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const showNews = this.settingsService.publicSettings?.showNews ?? false;
        if (!showNews) {
            throw new ForbiddenError();
        }

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            const pageString = params['page'] as string;
            const sizeString = params['size'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);

            const downloadedArticles = await this.articlesService.all(page + 1, size, ArticleVisibility.News, true);
            this.articles.set(downloadedArticles);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }

    protected async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        const navigationExtras: NavigationExtras = {
            queryParams: { page: pageEvent.pageIndex, size: pageEvent.pageSize },
            queryParamsHandling: 'merge'
        };

        await this.router.navigate([], navigationExtras);
    }
}
