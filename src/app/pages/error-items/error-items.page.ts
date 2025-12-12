import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { PagedResult } from 'src/app/models/paged-result';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorItemsService } from 'src/app/services/http/error-items.service';
import { ErrorItem } from 'src/app/models/error-item';
import { ErrorItemSource } from 'src/app/models/error-item-source';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { MatDialog } from '@angular/material/dialog';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';
import { ErrorItemDialog } from 'src/app/dialogs/error-item-dialog/error-item.dialog';

@Component({
    selector: 'app-error-items',
    templateUrl: './error-items.page.html',
    styleUrls: ['./error-items.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ErrorItemsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly errorItemSource = ErrorItemSource;
    protected search = model('');
    protected isReady = signal(false);    
    protected pageIndex = signal(0);
    protected errorItems = signal<PagedResult<ErrorItem> | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);

    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['message', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['code', 'message', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['code', 'message', 'createdAt', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['source', 'code', 'message', 'clientVersion', 'serverVersion', 'createdAt', 'actions'];

    private authorizationService = inject(AuthorizationService);
    private errorItemsService = inject(ErrorItemsService);
    private loadingService = inject(LoadingService);
    private messageService = inject(MessagesService);
    private activatedRoute = inject(ActivatedRoute);
    private randomGeneratorService = inject(RandomGeneratorService);
    private router = inject(Router);
    private dialog = inject(MatDialog);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        if (!this.isAdministrator() && !this.isModerator()) {
            throw new ForbiddenError();
        }

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            const pageString = params['page'] as string;
            const sizeString = params['size'] as string;
            const query = params['query'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);
            this.search.set(query);

            const downloadedErrorItems = await this.errorItemsService.get(page + 1, size, query);
            this.errorItems.set(downloadedErrorItems);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override async ngOnDestroy(): Promise<void> {
        this.routeParamsSubscription?.unsubscribe();
    }

    protected onOpenError(errorItem: ErrorItem): void {
        this.dialog.open(ErrorItemDialog, {
            width: '500px',
            data: errorItem
        });
    }

    protected async onSubmit(): Promise<void> {
        const navigationExtras: NavigationExtras = {
            queryParams: { query: this.search() },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected onDelete(item: ErrorItem): void {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete error?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    if (item.id) {
                        await this.errorItemsService.delete(item.id);
                        this.messageService.showSuccess('Error has been deleted.');
        
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

    protected async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        const navigationExtras: NavigationExtras = {
            queryParams: { page: pageEvent.pageIndex, size: pageEvent.pageSize },
            queryParamsHandling: 'merge'
        };

        await this.router.navigate([], navigationExtras);
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
