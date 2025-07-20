import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Article } from 'src/app/models/article';
import { ArticleFileInfo } from 'src/app/models/article-file-info';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { FileSizeService } from 'src/app/services/common/file-size.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { ArticlesService } from 'src/app/services/http/articles.service';

@Component({
    selector: 'app-article-edit',
    templateUrl: './article-edit.page.html',
    styleUrls: ['./article-edit.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ArticleEditPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected title = model('');
    protected body = model('');
    protected id = model('');
    protected color = model('');
    protected mainArticleFileInfoId = model<string | undefined>(undefined);
    protected articleFileInfos = signal<ArticleFileInfo[]>([]);
    protected alternativeAuthor = model('');
    protected showInNewsSignIn = model(false);
    protected showInNewsSignOut = model(false);
    protected showInHomeSignIn = model(false);
    protected showInHomeSignOut = model(false);
    protected maxArticleFileSizeString = signal('');

    private readonly defaultArticleMaxFileSize = 10485760;
    private routeParamsSubscription?: Subscription;

    private messageService = inject(MessagesService);
    private articlesService = inject(ArticlesService);
    private activatedRoute = inject(ActivatedRoute);
    private loadingService = inject(LoadingService);
    private fileSizeService = inject(FileSizeService);
    private clipboard = inject(Clipboard);
    private router = inject(Router);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.maxArticleFileSizeString.set(this.fileSizeService.getHumanFileSize(this.defaultArticleMaxFileSize, 0));

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
                    this.mainArticleFileInfoId.set(article.mainArticleFileInfo?.id);
                    this.alternativeAuthor.set(article.alternativeAuthor ?? '');
                    this.articleFileInfos.set(article.articleFileInfos ?? []);

                    for(const visibility of article.visibilities ?? []) {
                        if (visibility === ArticleVisibility.SignInNews) {
                            this.showInNewsSignIn.set(true);
                        }

                        if (visibility === ArticleVisibility.SignOutNews) {
                            this.showInNewsSignOut.set(true);
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

            if (this.alternativeAuthor()) {
                article.alternativeAuthor = this.alternativeAuthor();
            }

            if (this.showInNewsSignIn()) {
                article.visibilities.push(ArticleVisibility.SignInNews);
            }

            if (this.showInNewsSignOut()) {
                article.visibilities.push(ArticleVisibility.SignOutNews);
            }

            if (this.showInHomeSignIn()) {
                article.visibilities.push(ArticleVisibility.SignInHome);
            }

            if (this.showInHomeSignOut()) {
                article.visibilities.push(ArticleVisibility.SignOutHome);
            }

            if (this.id()) {
                await this.articlesService.update(this.id(), article);
                this.messageService.showSuccess('The article has been updated.');                
            } else {
                await this.articlesService.create(article);
                this.messageService.showSuccess('The article has been saved.');
            }
            
            this.router.navigate(['/articles']);
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onFileSelected(event: any): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (!input.files) {
            return;
        }

        const file = input.files[0];
        if (file.size > this.defaultArticleMaxFileSize) {
            this.messageService.showError(`Uploaded file is too large. Maximum size is ${this.maxArticleFileSizeString()}.`);
            return;
        }

        try {
            this.loadingService.showLoader();

            const formData = new FormData();
            formData.append('file', file);

            const articleFileInfo = await this.articlesService.fileUpload(this.id(), formData);
            
            this.articleFileInfos.update((list) => {
                list = [...list, articleFileInfo];
                return list
            });

        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.loadingService.hideLoader();
            input.value = '';
        }
    }

    protected async onDeleteFile(articleFileInfo: ArticleFileInfo): Promise<void> {
        try {
            this.loadingService.showLoader();

            if (articleFileInfo.id) {
                await this.articlesService.fileDelete(this.id(), articleFileInfo.id);            
                this.articleFileInfos.update((list) => {
                    list = list.filter(x => x.id !== articleFileInfo.id)
                    return list
                });
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.loadingService.hideLoader();
        }
    }

    protected async onMarkAsMainFile(articleFileInfo: ArticleFileInfo): Promise<void> {
        try {
            this.loadingService.showLoader();

            if (articleFileInfo.id) {
                await this.articlesService.markAsMainFile(this.id(), articleFileInfo.id);     
                this.mainArticleFileInfoId.set(articleFileInfo.id);
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.loadingService.hideLoader();
        }
    }

    protected onCopyMarkdown(articleFileInfo: ArticleFileInfo): void {
        this.clipboard.copy(`![Image ${articleFileInfo.id}](${articleFileInfo.url})`);
        this.messageService.showSuccess('Markdown code has been copied into clipboard.');
    }
}
