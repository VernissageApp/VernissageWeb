import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Article } from 'src/app/models/article';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { WindowService } from 'src/app/services/common/window.service';
import { ArticlesService } from 'src/app/services/http/articles.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-news-preview',
    templateUrl: './news-preview.page.html',
    styleUrls: ['./news-preview.page.scss'],
    animations: fadeInAnimation,
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
    private metaService = inject(Meta);;

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
        const newsDescription = this.htmlToText(this.article()?.bodyHtml ?? '').slice(0, 200);

        // <title>John Doe (@john@vernissage.xxx)</title>
        this.titleService.setTitle(newsTitle);

        // <meta name="description" content="My suite of cool apps is coming together nicely. What would you like to see me build next?">
        this.metaService.updateTag({ name: 'description', content: newsDescription });

        // <meta property="og:url" content="https://vernissage.xxx/@user">
        this.metaService.updateTag({ property: 'og:url', content: `${this.windowService.getApplicationBaseUrl()}/news/${this.article()?.id ?? ''}` });

        // <meta property="og:type" content="website">
        this.metaService.updateTag({ property: 'og:type', content: 'website' });

        // <meta property="og:title" content="John Doe (@john@vernissage.xxx)">
        this.metaService.updateTag({ property: 'og:title', content: newsTitle });

        // <meta property="og:description" content="Something apps next?">
        this.metaService.updateTag({ property: 'og:description', content: newsDescription });

        // <meta property="og:logo" content="https://vernissage.xxx/assets/icons/icon-128x128.png" />
        this.metaService.updateTag({ property: 'og:logo', content: `${this.windowService.getApplicationBaseUrl()}/assets/icons/icon-128x128.png` });

        const avatarImage = this.article()?.user?.avatarUrl;
        if (avatarImage) {
            // <meta property="og:image" content="https://files.vernissage.xxx/media_attachments/files/112348.png">
            this.metaService.updateTag({ property: 'og:image', content: avatarImage });

            // <meta property="og:image:width"" content="1532">
            this.metaService.updateTag({ property: 'og:image:width', content: '600' });

            // <meta property="og:image:height"" content="1416">
            this.metaService.updateTag({ property: 'og:image:height', content: '600' });
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
        this.metaService.updateTag({ property: 'og:url', content: '' });
        this.metaService.updateTag({ property: 'og:type', content: '' });
        this.metaService.updateTag({ property: 'og:title', content: '' });
        this.metaService.updateTag({ property: 'og:description', content: '' });
        this.metaService.updateTag({ property: 'og:logo', content: '' });
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
