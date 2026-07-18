import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { PagedResult } from 'src/app/models/paged-result';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArticlesService } from 'src/app/services/http/articles.service';
import { Article } from 'src/app/models/article';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { SettingsService } from 'src/app/services/http/settings.service';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LanguageService } from 'src/app/services/common/language.service';

import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MiniUserCardComponent } from '../../components/widgets/mini-user-card/mini-user-card.component';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
    selector: 'app-news',
    templateUrl: './news.page.html',
    styleUrls: ['./news.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCard, MatCardHeader, MatCardTitle, RouterLink, MatCardSubtitle, MiniUserCardComponent, MatCardContent, MatCardFooter, MatPaginator, TranslatePipe, LocalizedDatePipe]
})
export class NewsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected articleVisibility = ArticleVisibility;

    protected isReady = signal(false);
    protected articles = signal<PagedResult<Article> | undefined>(undefined);
    protected pageIndex = signal(0);

    private routeParamsSubscription?: Subscription;
    
    private articlesService = inject(ArticlesService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private settingsService = inject(SettingsService);
    private authorizationService = inject(AuthorizationService);
    private languageService = inject(LanguageService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const isLoggedIn = await this.authorizationService.isLoggedIn();

        const showNewsForAnonymous = this.settingsService.publicSettings?.showNewsForAnonymous ?? false;
        if (!isLoggedIn && !showNewsForAnonymous) {
            throw new ForbiddenError();
        }

        const showNews = this.settingsService.publicSettings?.showNews ?? false;
        if (isLoggedIn && !showNews) {
            throw new ForbiddenError();
        }

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            const pageString = params['page'] as string;
            const sizeString = params['size'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);
            const articlesVisibility = isLoggedIn ? ArticleVisibility.SignInNews : ArticleVisibility.SignOutNews;

            const downloadedArticles = await this.articlesService.all(page + 1, size, articlesVisibility, true, this.getArticleLanguage());
            this.articles.set(downloadedArticles);
            await this.updateArticleMarker(isLoggedIn, page, downloadedArticles.data[0]);

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

    private getArticleLanguage(): string {
        return this.languageService.getCurrentLanguageLocale().replace('-', '_');
    }

    private async updateArticleMarker(isLoggedIn: boolean, page: number, firstArticle?: Article): Promise<void> {
        if (!isLoggedIn || page !== 0 || !firstArticle?.id) {
            return;
        }

        try {
            await this.articlesService.marker(firstArticle.id);
            this.articlesService.changes.next(0);
        } catch (error) {
            console.error(error);
        }
    }
}
