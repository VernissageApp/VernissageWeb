import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Article } from 'src/app/models/article';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { WindowService } from 'src/app/services/common/window.service';
import { ArticlesService } from 'src/app/services/http/articles.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-news-preview',
    templateUrl: './news-preview.page.html',
    styleUrls: ['./news-preview.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NewsPreviewPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected article = signal<Article | undefined>(undefined);

    private routeParamsSubscription?: Subscription;

    private document = inject(DOCUMENT);
    private articlesService = inject(ArticlesService);
    private activatedRoute = inject(ActivatedRoute);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private authorizationService = inject(AuthorizationService);
    private windowService = inject(WindowService);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private userDisplayService = inject(UserDisplayService);

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

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.isReady.set(false);
            this.loadingService.showLoader();

            const articleId = params['id'] as string;
            if (articleId) {
                const internalArticle = await this.articlesService.read(articleId);
                this.article.set(internalArticle);
                this.setCardMetaTags();
            }

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.clearCardMetaTags();
        this.routeParamsSubscription?.unsubscribe();
    }

    private setCardMetaTags(): void {
        const newsTitle = this.article()?.title ?? 'Vernissage - news';
        const newsDescription = this.htmlToText(this.article()?.bodyHtml ?? '').slice(0, 400);
        const newsUserDisplayName = this.userDisplayService.displayName(this.article()?.user);
        const newsAuthor = this.article()?.alternativeAuthor;

        // <title>John Doe (@john@vernissage.xxx)</title>
        this.titleService.setTitle(newsTitle);

        // <meta name="description" content="My suite of cool apps is coming together nicely. What would you like to see me build next?">
        this.metaService.updateTag({ name: 'description', content: newsDescription });

        // <meta name="author" content="John Doe">
        this.metaService.updateTag({ name: 'author', content: newsUserDisplayName});

        // <meta name="fediverse:creator" content="@johndoe@mastodon.xxx" />
        this.metaService.updateTag({ name: 'fediverse:creator', content: newsAuthor ?? '' });

        // <meta property="og:url" content="https://vernissage.xxx/@user">
        this.metaService.updateTag({ property: 'og:url', content: `${this.windowService.getApplicationBaseUrl()}/news/${this.article()?.id ?? ''}` });

        // <meta property="og:type" content="website">
        this.metaService.updateTag({ property: 'og:type', content: 'article' });

        // <meta property="og:title" content="John Doe (@john@vernissage.xxx)">
        this.metaService.updateTag({ property: 'og:title', content: newsTitle });

        // <meta property="og:description" content="Something apps next?">
        this.metaService.updateTag({ property: 'og:description', content: newsDescription });

        // <meta property="og:logo" content="https://vernissage.xxx/assets/icons/icon-128x128.png" />
        this.metaService.updateTag({ property: 'og:logo', content: `${this.windowService.getApplicationBaseUrl()}/assets/icons/icon-128x128.png` });

        // <meta property="article:published_time" content="2025-04-30T18:45:41+00:00">
        const publishedTime = formatDate(this.article()?.createdAt ?? new Date(), 'yyyy-MM-ddTHH:mm:ssZ', 'en-US');
        this.metaService.updateTag({ property: 'article:published_time', content: publishedTime });

        // <meta property="article:modified_time" content="2025-04-30T18:45:41+00:00">
        const modifiedTime = formatDate(this.article()?.updatedAt ?? new Date(), 'yyyy-MM-ddTHH:mm:ssZ', 'en-US');
        this.metaService.updateTag({ property: 'article:modified_time', content: modifiedTime });

        const mainArticleFileInfo = this.article()?.mainArticleFileInfo;
        if (mainArticleFileInfo) {
            // <meta property="og:image" content="https://files.vernissage.xxx/media_attachments/files/112348.png">
            this.metaService.updateTag({ property: 'og:image', content: mainArticleFileInfo.url });

            // <meta property="og:image:width"" content="1532">
            this.metaService.updateTag({ property: 'og:image:width', content: mainArticleFileInfo.width.toString() });

            // <meta property="og:image:height"" content="1416">
            this.metaService.updateTag({ property: 'og:image:height', content: mainArticleFileInfo.height.toString() });
        } else {
            this.metaService.updateTag({ property: 'og:image', content: '' });
            this.metaService.updateTag({ property: 'og:image:width', content: '' });
            this.metaService.updateTag({ property: 'og:image:height', content: '' });
        }

        // <meta name="twitter:card" content="summary_large_image">
        this.metaService.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    }

    private clearCardMetaTags(): void {
        this.titleService.setTitle('');
        this.metaService.updateTag({ name: 'description', content: '' });
        this.metaService.updateTag({ name: 'author', content: '' });
        this.metaService.updateTag({ name: 'fediverse:creator', content: '' });
        this.metaService.updateTag({ property: 'og:url', content: '' });
        this.metaService.updateTag({ property: 'og:type', content: '' });
        this.metaService.updateTag({ property: 'og:title', content: '' });
        this.metaService.updateTag({ property: 'og:description', content: '' });
        this.metaService.updateTag({ property: 'og:logo', content: '' });
        this.metaService.updateTag({ property: 'article:published_time', content: '' });
        this.metaService.updateTag({ property: 'article:modified_time', content: '' });
        this.metaService.updateTag({ property: 'og:image', content: '' });
        this.metaService.updateTag({ property: 'og:image:width', content: '' });
        this.metaService.updateTag({ property: 'og:image:height', content: '' });
        this.metaService.updateTag({ property: 'twitter:card', content: '' });
    }

    private htmlToText(value: string): string {
        const temp = this.document.createElement('div');
        temp.innerHTML = value;
        return temp.textContent || temp.innerText || '';
    }
}
