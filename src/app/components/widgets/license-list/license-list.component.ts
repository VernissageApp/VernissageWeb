import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { LicenseDialog } from 'src/app/dialogs/license-dialog/license.dialog';
import { License } from 'src/app/models/license';
import { PagedResult } from 'src/app/models/paged-result';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LicensesService } from 'src/app/services/http/licenses.service';

@Component({
    selector: 'app-license-list',
    templateUrl: './license-list.component.html',
    styleUrls: ['./license-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LicenseListComponent extends ResponsiveComponent implements OnInit {
    protected licenses = signal<PagedResult<License> | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);
    protected pageIndex = signal(0);

    private pageSize = 10;
    private readonly displayedColumnsHandsetPortrait: string[] = ['code', 'licenseName', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['code', 'licenseName', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['code', 'licenseName', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['code', 'licenseName', 'actions'];

    private licensesService = inject(LicensesService);
    private messageService = inject(MessagesService);
    private dialog = inject(MatDialog);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const licensesInternal = await this.licensesService.get(this.pageIndex() + 1, this.pageSize);
        this.licenses.set(licensesInternal);
    }

    protected async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        this.pageIndex.set(pageEvent.pageIndex);
        this.pageSize = pageEvent.pageSize;

        const licensesInternal = await this.licensesService.get(this.pageIndex() + 1, this.pageSize);
        this.licenses.set(licensesInternal);
    }

    protected async onDelete(license: License): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: 'Do you want to delete license?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    await this.licensesService.delete(license.id ??  '');
                    this.messageService.showSuccess('License has been deleted.');

                    const licensesInternal = await this.licensesService.get(this.pageIndex() + 1, this.pageSize);
                    this.licenses.set(licensesInternal);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected openLicenseDialog(license: License | undefined): void {
        const dialogRef = this.dialog.open(LicenseDialog, {
            width: '500px',
            data: (license ?? new License())
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                const licensesInternal = await this.licensesService.get(this.pageIndex() + 1, this.pageSize);
                this.licenses.set(licensesInternal);
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
