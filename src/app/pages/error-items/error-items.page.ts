import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { PaginableResult } from 'src/app/models/paginable-result';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorItemsService } from 'src/app/services/http/error-items.service';
import { ErrorItem } from 'src/app/models/error-item';
import { ErrorItemSource } from 'src/app/models/error-item-source';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { MatDialog } from '@angular/material/dialog';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';

@Component({
    selector: 'app-error-items',
    templateUrl: './error-items.page.html',
    styleUrls: ['./error-items.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class ErrorItemsPage extends ResponsiveComponent implements OnInit {
    readonly errorItemSource = ErrorItemSource;

    search = '';
    isReady = false;
    pageIndex = 0;
    errorItems?: PaginableResult<ErrorItem>;
    displayedColumns: string[] = [];
    routeParamsSubscription?: Subscription;

    private readonly displayedColumnsHandsetPortrait: string[] = ['message', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['code', 'message', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['code', 'message', 'createdAt', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['source', 'code', 'message', 'clientVersion', 'serverVersion', 'createdAt', 'actions'];
    
    constructor(
        private authorizationService: AuthorizationService,
        private errorItemsService: ErrorItemsService,
        private loadingService: LoadingService,
        private messageService: MessagesService,
        private activatedRoute: ActivatedRoute,
        private randomGeneratorService: RandomGeneratorService,
        private router: Router,
        private dialog: MatDialog,
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
            const query = params['query'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex = page;
            this.search = query
            this.errorItems = await this.errorItemsService.get(page + 1, size, query);

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    async onSubmit(): Promise<void> {
        const navigationExtras: NavigationExtras = {
            queryParams: { query: this.search },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    onDelete(item: ErrorItem): void {
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
        this.displayedColumns = this.displayedColumnsHandsetLandscape;
    }

    protected override onTablet(): void {
        this.displayedColumns = this.displayedColumnsTablet;
    }

    protected override onBrowser(): void {
        this.displayedColumns = this.displayedColumnsBrowser;
    }

    isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }
}
