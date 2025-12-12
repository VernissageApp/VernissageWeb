import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { PagedResult } from 'src/app/models/paged-result';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArticlesService } from 'src/app/services/http/articles.service';
import { Article } from 'src/app/models/article';
import { ArticleVisibility } from 'src/app/models/article-visibility';
import { MessagesService } from 'src/app/services/common/messages.service';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { MatDialog } from '@angular/material/dialog';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';

@Component({
    selector: 'app-articles',
    templateUrl: './articles.page.html',
    styleUrls: ['./articles.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ArticlesPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected articleVisibility = ArticleVisibility;

    protected isReady = signal(false);
    protected articles = signal<PagedResult<Article> | undefined>(undefined);
    protected pageIndex = signal(0);
    protected displayedColumns = signal<string[]>([]);

    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['title', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['title', 'createdAt', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['title', 'visibility', 'createdAt', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['title', 'visibility', 'createdAt', 'actions'];

    private authorizationService = inject(AuthorizationService);
    private articlesService = inject(ArticlesService);
    private loadingService = inject(LoadingService);
    private messageService = inject(MessagesService);
    private activatedRoute = inject(ActivatedRoute);
    private randomGeneratorService = inject(RandomGeneratorService);
    private dialog = inject(MatDialog);
    private router = inject(Router);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        if (!this.isAdministrator() && !this.isModerator()) {
            throw new ForbiddenError();
        }

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            const pageString = params['page'] as string;
            const sizeString = params['size'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);

            const downloadedArticles = await this.articlesService.get(page + 1, size, true);
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

    protected onCreateArticle(): void {
        this.router.navigate(['articles/create']);
    }

    protected onEdit(article: Article): void {
        this.router.navigate(['articles', article.id]);
    }

    protected async onDelete(article: Article): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete article?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    if (article.id) {
                        await this.articlesService.delete(article.id);
                        this.messageService.showSuccess('Article was deleted.');
        
                        const navigationExtras: NavigationExtras = {
                            queryParams: { t: this.randomGeneratorService.generateString(8) },
                            queryParamsHandling: 'merge'
                        };
                
                        await this.router.navigate([], navigationExtras);
                    }
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected override onHandsetPortrait(): void {
        this.displayedColumns?.set(this.displayedColumnsHandsetPortrait);
    }

    protected override onHandsetLandscape(): void {
        this.displayedColumns?.set(this.displayedColumnsHandsetLandscape);
    }

    protected override onTablet(): void {
        this.displayedColumns?.set(this.displayedColumnsTablet);
    }

    protected override onBrowser(): void {
        this.displayedColumns?.set(this.displayedColumnsBrowser);
    }

    private isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    private isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }
}
