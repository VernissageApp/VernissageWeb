import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { HomeCardDialog } from 'src/app/dialogs/home-card-dialog/home-card.dialog';
import { HomeCard } from 'src/app/models/home-card';
import { License } from 'src/app/models/license';
import { PagedResult } from 'src/app/models/paged-result';
import { MessagesService } from 'src/app/services/common/messages.service';
import { HomeCardsService } from 'src/app/services/http/home-cards.service';

@Component({
    selector: 'app-home-cards',
    templateUrl: './home-cards.component.html',
    styleUrls: ['./home-cards.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomeCardsComponent extends ResponsiveComponent implements OnInit {
    protected homeCards = signal<PagedResult<HomeCard> | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);
    protected pageIndex = signal(0);

    private pageSize = 10;
    private readonly displayedColumnsHandsetPortrait: string[] = ['order', 'title', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['order', 'title', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['order', 'title', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['order', 'title', 'actions'];

    private homeCardsService = inject(HomeCardsService);
    private messageService = inject(MessagesService);
    private dialog = inject(MatDialog);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const homeCardsInternal = await this.homeCardsService.get(this.pageIndex() + 1, this.pageSize);
        this.homeCards.set(homeCardsInternal);
    }

    protected async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        this.pageIndex.set(pageEvent.pageIndex);
        this.pageSize = pageEvent.pageSize;

        const homeCardsInternal = await this.homeCardsService.get(this.pageIndex() + 1, this.pageSize);
        this.homeCards.set(homeCardsInternal);
    }

    protected async onDelete(license: License): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete home card?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.homeCardsService.delete(license.id ??  '');
                    this.messageService.showSuccess('Home card has been deleted.');

                    const homeCardsInternal = await this.homeCardsService.get(this.pageIndex() + 1, this.pageSize);
                    this.homeCards.set(homeCardsInternal);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected openHomeCardDialog(homeCard: HomeCard | undefined): void {
        const dialogRef = this.dialog.open(HomeCardDialog, {
            width: '500px',
            data: (homeCard ?? new HomeCard())
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                const homeCardsInternal = await this.homeCardsService.get(this.pageIndex() + 1, this.pageSize);
                this.homeCards.set(homeCardsInternal);
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
}
