import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { InstanceBlockedDomainDialog } from 'src/app/dialogs/instance-blocked-domain-dialog/instance-blocked-domain.dialog';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';
import { PagedResult } from 'src/app/models/paged-result';
import { MessagesService } from 'src/app/services/common/messages.service';
import { InstanceBlockedDomainsService } from 'src/app/services/http/instance-blocked-domains.service';

@Component({
    selector: 'app-domain-blocks',
    templateUrl: './domain-blocks.component.html',
    styleUrls: ['./domain-blocks.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DomainBlocksComponent extends ResponsiveComponent implements OnInit {
    protected domains = signal<PagedResult<InstanceBlockedDomain> | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);
    protected pageIndex = signal(0);

    private pageSize = 10;
    private readonly displayedColumnsHandsetPortrait: string[] = ['domain', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['domain', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['domain', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['domain', 'actions'];

    private instanceBlockedDomainsService = inject(InstanceBlockedDomainsService);
    private messageService = inject(MessagesService);
    private dialog = inject(MatDialog);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const domainsInternal = await this.instanceBlockedDomainsService.get(this.pageIndex() + 1, this.pageSize);
        this.domains.set(domainsInternal);
    }

    protected async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        this.pageIndex.set(pageEvent.pageIndex);
        this.pageSize = pageEvent.pageSize;

        const domainsInternal = await this.instanceBlockedDomainsService.get(this.pageIndex() + 1, this.pageSize);
        this.domains.set(domainsInternal);
    }

    protected async onDelete(instanceBlockedDomain: InstanceBlockedDomain): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete instance blocked domain?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.instanceBlockedDomainsService.delete(instanceBlockedDomain.id);
                    this.messageService.showSuccess('Domain has been deleted.');

                    const domainsInternal = await this.instanceBlockedDomainsService.get(this.pageIndex() + 1, this.pageSize);
                    this.domains.set(domainsInternal);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected openInstanceBlockedDomainDialog(instanceBlockedDomain: InstanceBlockedDomain | undefined): void {
        const dialogRef = this.dialog.open(InstanceBlockedDomainDialog, {
            width: '500px',
            data: (instanceBlockedDomain ?? new InstanceBlockedDomain())
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                const domainsInternal = await this.instanceBlockedDomainsService.get(this.pageIndex() + 1, this.pageSize);
                this.domains.set(domainsInternal);
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
