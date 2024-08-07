import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { Report } from 'src/app/models/report';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ReportsService } from 'src/app/services/http/reports.service';
import { Role } from 'src/app/models/role';
import { PaginableResult } from 'src/app/models/paginable-result';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReportDetailsDialog } from 'src/app/dialogs/report-details-dialog/report-details.dialog';
import { MatDialog } from '@angular/material/dialog';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { ContentWarningDialog } from 'src/app/dialogs/content-warning-dialog/content-warning.dialog';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.page.html',
    styleUrls: ['./reports.page.scss'],
    animations: fadeInAnimation
})
export class ReportsPage extends ResponsiveComponent implements OnInit {
    readonly avatarSize = AvatarSize;

    isReady = false;
    pageIndex = 0;
    reports?: PaginableResult<Report>;
    displayedColumns: string[] = [];
    routeParamsSubscription?: Subscription;

    private readonly displayedColumnsHandsetPortrait: string[] = ['reportedUser', 'status'];
    private readonly displayedColumnsHandserLandscape: string[] = ['reportedUser', 'status', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['user', 'reportedUser', 'category', 'status', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['user', 'reportedUser', 'status', 'category', 'considerationUser', 'considerationDate', 'actions'];
    
    constructor(
        private authorizationService: AuthorizationService,
        private reportsService: ReportsService,
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private loadingService: LoadingService,
        private activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private router: Router,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

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

            this.pageIndex = page;
            this.reports = await this.reportsService.get(page + 1, size);

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    async handlePageEvent(pageEvent: PageEvent): Promise<void> {
        const navigationExtras: NavigationExtras = {
            queryParams: { page: pageEvent.pageIndex, size: pageEvent.pageSize },
            queryParamsHandling: 'merge'
        };

        await this.router.navigate([], navigationExtras);
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

    onOpen(report: Report): void {
        this.dialog.open(ReportDetailsDialog, {
            width: '500px',
            data: report
        });
    }

    async onClose(report: Report): Promise<void> {
        try {
            const savedReport = await this.reportsService.close(report.id);
            report.considerationUser = savedReport.considerationUser;
            report.considerationDate = savedReport.considerationDate;

            this.messageService.showSuccess('Report has been closed.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onRestore(report: Report): Promise<void> {
        try {
            const savedReport = await this.reportsService.restore(report.id);
            report.considerationUser = savedReport.considerationUser;
            report.considerationDate = savedReport.considerationDate;

            this.messageService.showSuccess('Report has been restored.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onUnlist(report: Report): Promise<void> {
        try {
            if (!report.status) {
                return;
            }

            await this.statusesService.unlist(report.status.id);
            const savedReport = await this.reportsService.close(report.id);
            report.considerationUser = savedReport.considerationUser;
            report.considerationDate = savedReport.considerationDate;

            this.messageService.showSuccess('Status has been unlisted.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onDelete(report: Report): Promise<void> {
        try {
            if (!report.status) {
                return;
            }

            await this.statusesService.delete(report.status.id);
            this.messageService.showSuccess('Status has been deleted.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onApplyCW(report: Report): Promise<void> {
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

                    const savedReport = await this.reportsService.close(report.id);
                    report.considerationUser = savedReport.considerationUser;
                    report.considerationDate = savedReport.considerationDate;
        
                    this.messageService.showSuccess('Content warning has been added.');
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }
}
