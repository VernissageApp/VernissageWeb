import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { InstanceBlockedDomainDialog } from 'src/app/dialogs/instance-blocked-domain-dialog/instance-blocked-domain.dialog';
import { InstanceBlockedDomain } from 'src/app/models/instance-blocked-domain';
import { PaginableResult } from 'src/app/models/paginable-result';
import { MessagesService } from 'src/app/services/common/messages.service';
import { InstanceBlockedDomainsService } from 'src/app/services/http/instance-blocked-domains.service';

@Component({
    selector: 'app-domain-blocks',
    templateUrl: './domain-blocks.component.html',
    styleUrls: ['./domain-blocks.component.scss'],
    standalone: false
})
export class DomainBlocksComponent extends ResponsiveComponent implements OnInit {
    domains?: PaginableResult<InstanceBlockedDomain>;
    displayedColumns: string[] = [];
    pageIndex = 0;
    pageSize = 10;

    private readonly displayedColumnsHandsetPortrait: string[] = ['domain', 'actions'];
    private readonly displayedColumnsHandserLandscape: string[] = ['domain', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['domain', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['domain', 'actions'];

    constructor(
        private instanceBlockedDomainsService: InstanceBlockedDomainsService,
        private messageService: MessagesService,
        public dialog: MatDialog,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.domains = await this.instanceBlockedDomainsService.get(this.pageIndex + 1, this.pageSize);
    }

    async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        this.pageIndex = pageEvent.pageIndex;
        this.pageSize = pageEvent.pageSize;

        this.domains = await this.instanceBlockedDomainsService.get(this.pageIndex + 1, this.pageSize);
    }

    async onDelete(instanceBlockedDomain: InstanceBlockedDomain): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete instance blocked domain?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.instanceBlockedDomainsService.delete(instanceBlockedDomain.id);
                    this.messageService.showSuccess('Domain has been deleted.');
                    this.domains = await this.instanceBlockedDomainsService.get(this.pageIndex + 1, this.pageSize);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    openInstanceBlockedDomainDialog(instanceBlockedDomain: InstanceBlockedDomain | undefined): void {
        const dialogRef = this.dialog.open(InstanceBlockedDomainDialog, {
            width: '500px',
            data: (instanceBlockedDomain ?? new InstanceBlockedDomain())
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                this.domains = await this.instanceBlockedDomainsService.get(this.pageIndex + 1, this.pageSize);
            }
        });
    }

    protected override onHandsetPortrait(): void {
        this.displayedColumns = this.displayedColumnsHandsetPortrait;
    }

    protected override onHandsetLandscape(): void {
        this.displayedColumns = this.displayedColumnsHandserLandscape;
    }

    protected override onTablet(): void {
        this.displayedColumns = this.displayedColumnsTablet;
    }

    protected override onBrowser(): void {
        this.displayedColumns = this.displayedColumnsBrowser;
    }
}

