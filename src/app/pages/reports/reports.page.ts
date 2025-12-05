import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Report } from 'src/app/models/report';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ReportsService } from 'src/app/services/http/reports.service';
import { Role } from 'src/app/models/role';
import { PagedResult } from 'src/app/models/paged-result';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReportDetailsDialog } from 'src/app/dialogs/report-details-dialog/report-details.dialog';
import { MatDialog } from '@angular/material/dialog';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { ContentWarningDialog } from 'src/app/dialogs/content-warning-dialog/content-warning.dialog';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.page.html',
    styleUrls: ['./reports.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ReportsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly avatarSize = AvatarSize;
    protected isReady = signal(false);
    protected pageIndex = signal(0);
    protected reports = signal<PagedResult<Report> | undefined>(undefined);
    protected displayedColumns = signal<string[]>([]);

    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['reportedUser', 'status'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['reportedUser', 'status', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['type', 'user', 'reportedUser', 'category', 'status', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['type', 'user', 'reportedUser', 'status', 'category', 'considerationUser', 'considerationDate', 'actions'];

    private authorizationService = inject(AuthorizationService);
    private randomGeneratorService = inject(RandomGeneratorService);
    private reportsService = inject(ReportsService);
    private statusesService = inject(StatusesService);
    private messageService = inject(MessagesService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);
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
            const downloadedReports = await this.reportsService.get(page + 1, size);
            this.reports.set(downloadedReports);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    async handlePageEvent(pageEvent: PageEvent): Promise<void> {
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

    protected getReportType(report: Report): string {
        if (report.status) {
            if (report.status.replyToStatusId) {
                return 'Comment';
            }

            return 'Status';
        }

        return 'Profile';
    }

    protected onOpen(report: Report): void {
        this.dialog.open(ReportDetailsDialog, {
            width: '500px',
            data: report
        });
    }

    protected async onClose(report: Report): Promise<void> {
        try {
            await this.reportsService.close(report.id);
            await this.refreshList();

            this.messageService.showSuccess('Report has been closed.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onRestore(report: Report): Promise<void> {
        try {
            await this.reportsService.restore(report.id);
            await this.refreshList();

            this.messageService.showSuccess('Report has been restored.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onUnlist(report: Report): Promise<void> {
        try {
            if (!report.status) {
                return;
            }

            await this.statusesService.unlist(report.status.id);
            await this.reportsService.close(report.id);
            await this.refreshList();

            this.messageService.showSuccess('Status has been unlisted.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onDelete(report: Report): Promise<void> {
        try {
            if (!report.status) {
                return;
            }

            await this.statusesService.delete(report.status.id);
            await this.refreshList();

            this.messageService.showSuccess('Status has been deleted.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onApplyCW(report: Report): Promise<void> {
        if (!report.status) {
            return;
        }

        const dialogRef = this.dialog.open(ContentWarningDialog, { data: report.status.id });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.contentWarning) {
                try {
                    if (!result?.statusId) {
                        return;
                    }
        
                    await this.statusesService.applyContentWarning(result?.statusId, result?.contentWarning);
                    await this.reportsService.close(report.id);
                    await this.refreshList();
        
                    this.messageService.showSuccess('Content warning has been added.');
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    private isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    private isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }

    private async refreshList(): Promise<void> {
        const navigationExtras: NavigationExtras = {
            queryParams: { t: this.randomGeneratorService.generateString(8) },
            queryParamsHandling: 'merge'
        };

        await this.router.navigate([], navigationExtras);
    }
}
