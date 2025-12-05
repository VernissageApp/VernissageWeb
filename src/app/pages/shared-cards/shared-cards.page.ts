import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { ShareBusinessCardDialog } from 'src/app/dialogs/share-business-card-dialog/share-business-card.dialog';
import { PagedResult } from 'src/app/models/paged-result';
import { SharedBusinessCard } from 'src/app/models/shared-business-card';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';
import { BusinessCardsService } from 'src/app/services/http/business-cards.service';
import { SharedBusinessCardsService } from 'src/app/services/http/shared-business-cards.service';

@Component({
    selector: 'app-shared-cards',
    templateUrl: './shared-cards.page.html',
    styleUrls: ['./shared-cards.page.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SharedCardsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);

    protected sharedBusinessCards = signal<PagedResult<SharedBusinessCard> | undefined>(undefined);
    protected pageIndex = signal(0);
    protected displayedColumns = signal<string[]>([]);

    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['title', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['title', 'createdAt', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['title', 'thirdPartyName', 'thirdPartyEmail', 'createdAt', 'enabled', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['title', 'thirdPartyName', 'thirdPartyEmail', 'createdAt', 'enabled', 'actions'];

    private loadingService = inject(LoadingService);
    private sharedBusinessCardsService = inject(SharedBusinessCardsService);
    private businessCardsService = inject(BusinessCardsService);
    private dialog = inject(MatDialog);
    private messageService = inject(MessagesService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private randomGeneratorService = inject(RandomGeneratorService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            const pageString = params['page'] as string;
            const sizeString = params['size'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);

            const downloadedSharedBusinessCards = await this.sharedBusinessCardsService.get(page + 1, size);
            this.sharedBusinessCards.set(downloadedSharedBusinessCards);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }

    protected async onShareBusinessCard(): Promise<void> {
        const businessCardExists = await this.businessCardsService.businessCardExists();
        if (!businessCardExists) {
            this.messageService.showError('You need to create business card first.');
            return;
        }

        const dialogRef = this.dialog.open(ShareBusinessCardDialog, { width: '500px' });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    const sharedBusinessCard = await this.sharedBusinessCardsService.create(result);
                    this.messageService.showSuccess('Business card has been shared.');

                    this.router.navigate(['/shared-cards', sharedBusinessCard.id], { queryParams: { 'qr': true } });
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected async onRevokedChange(id: string, isEnabled: boolean): Promise<void> {
        try {
            if (!isEnabled) {
                await this.sharedBusinessCardsService.revoke(id);
                this.messageService.showSuccess('Shared business card has been revoked.');
            } else {
                await this.sharedBusinessCardsService.unrevoke(id);
                this.messageService.showSuccess('Shared business card has been enabled.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onEdit(sharedBusinessCard: SharedBusinessCard): Promise<void> {
        const dialogRef = this.dialog.open(ShareBusinessCardDialog, { 
            width: '500px',
            data: sharedBusinessCard
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    if(sharedBusinessCard.id) {
                        await this.sharedBusinessCardsService.update(sharedBusinessCard.id, result);
                        this.messageService.showSuccess('Business card has been updated.');

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

    protected onDelete(sharedBusinessCard: SharedBusinessCard): void {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete shared business card?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    if (sharedBusinessCard.id) {
                        await this.sharedBusinessCardsService.delete(sharedBusinessCard.id);
                        this.messageService.showSuccess('Shared business card was deleted.');
        
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
}
