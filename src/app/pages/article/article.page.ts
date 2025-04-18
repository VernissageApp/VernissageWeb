import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, model, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Article } from 'src/app/models/article';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { ArticlesService } from 'src/app/services/http/articles.service';

@Component({
    selector: 'app-article',
    templateUrl: './article.page.html',
    styleUrls: ['./article.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ArticlePage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected title = model('');
    protected body = model('');
    protected id = model('');
    protected color = model('');
    protected showInNews = model(false);
    protected showInHomeSignIn = model(false);
    protected showInHomeSignOut = model(false);

    private routeParamsSubscription?: Subscription;

    constructor(
        private messageService: MessagesService,
        private articlesService: ArticlesService,
        private activatedRoute: ActivatedRoute,
        private loadingService: LoadingService,
        private router: Router,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.isReady.set(false);
            this.loadingService.showLoader();

            const articleId = params['id'] as string;
            if (articleId) {
                const article = await this.articlesService.read(articleId);
                if (article) {
                    this.id.set(article.id ?? '');
                    this.title.set(article.title ?? '');
                    this.body.set(article.body ?? '');
                    this.color.set(article.color ?? '');

                    for(const visibility of article.visibilities ?? []) {
                        if (visibility === ArticleVisibility.News) {
                            this.showInNews.set(true);
                        }

                        if (visibility === ArticleVisibility.SignInHome) {
                            this.showInHomeSignIn.set(true);
                        }

                        if (visibility === ArticleVisibility.SignOutHome) {
                            this.showInHomeSignOut.set(true);
                        }
                    }
                }
            }

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    protected onCancelClick(): void {
        this.router.navigate(['/articles']);
    }

    protected async onSubmit(): Promise<void> {
        try {
            const article = new Article();
            article.id = this.id();
            article.title = this.title();
            article.body = this.body();
            article.color = this.color();
            article.visibilities = [];

            if (this.showInNews()) {
                article.visibilities.push(ArticleVisibility.News);
            }

            if (this.showInHomeSignIn()) {
                article.visibilities.push(ArticleVisibility.SignInHome);
            }

            if (this.showInHomeSignOut()) {
                article.visibilities.push(ArticleVisibility.SignOutHome);
            }

            if (this.id()) {
                await this.articlesService.update(this.id(), article);
                this.messageService.showSuccess('Article was updated.');                
            } else {
                await this.articlesService.create(article);
                this.messageService.showSuccess('Article was saved.');
            }
            
            this.router.navigate(['/articles']);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}
