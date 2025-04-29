import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Article } from 'src/app/models/article';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
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

    private articlesService = inject(ArticlesService);
    private activatedRoute = inject(ActivatedRoute);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private authorizationService = inject(AuthorizationService);

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
            }

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }
}
