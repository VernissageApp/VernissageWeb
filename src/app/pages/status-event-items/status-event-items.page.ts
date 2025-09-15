import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { PagedResult } from 'src/app/models/paged-result';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { combineLatest, map, Subscription } from 'rxjs';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { StatusActivityPubEventItem } from 'src/app/models/status-activity-pub-event-item';
import { StatusEventErrorMessageDialog } from 'src/app/dialogs/status-event-error-message-dialog/status-event-error-message.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-status-event-items',
    templateUrl: './status-event-items.page.html',
    styleUrls: ['./status-event-items.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatusEventItemsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly avatarSize = AvatarSize
    protected readonly role = Role;

    protected onlyErrors = model(false);
    protected sortColumn = model('createdAt');
    protected sortDirection = model('descending');
    protected statusId = signal('');
    protected eventId = signal('');
    protected isReady = signal(false);
    protected eventItems = signal<PagedResult<StatusActivityPubEventItem> | undefined>(undefined);
    protected pageIndex = signal(0);
    protected displayedColumns = signal<string[]>([]);

    
    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['url', 'isSuccess', 'error'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['url', 'isSuccess', 'error'];
    private readonly displayedColumnsTablet: string[] = ['url', 'isSuccess', 'createdAt', 'startAt', 'error'];
    private readonly displayedColumnsBrowser: string[] = ['url', 'isSuccess', 'createdAt', 'startAt', 'endAt', 'error'];

    private statusesService = inject(StatusesService);
    private authorizationService = inject(AuthorizationService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private dialog = inject(MatDialog);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParamMap])
            .pipe(map(params => ({ routeParams: params[0], queryParams: params[1] })))
            .subscribe(async params => {

            this.loadingService.showLoader();

            const internalStatusId = params.routeParams['id'] as string;
            this.statusId.set(internalStatusId);
            const status = await this.statusesService.get(this.statusId());

            if (status.user?.userName !== this.authorizationService.getUser()?.userName && (!this.isAdministrator() && !this.isModerator())) {
                throw new ForbiddenError();
            }

            const internalEventId = params.routeParams['eventId'] as string;
            this.eventId.set(internalEventId);

            const pageString = params.queryParams.get('page');
            const sizeString = params.queryParams.get('size');
            const queryOnlyErrors = params.queryParams.get('onlyErrors');
            const sortColumn = params.queryParams.get('sortColumn');
            const sortDirection = params.queryParams.get('sortDirection');

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);
            this.onlyErrors.set(queryOnlyErrors === 'true');
            this.sortColumn.set(sortColumn ?? 'createdAt');
            this.sortDirection.set(sortDirection === 'ascending' ? 'ascending' : 'descending');

            const downloadedEvents = await this.statusesService.eventItems(this.statusId(), this.eventId(), page + 1, size, this.onlyErrors(), this.sortColumn(), this.sortDirection());
            this.eventItems.set(downloadedEvents);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }

    protected async onSubmit(): Promise<void> {
        const navigationExtras: NavigationExtras = {
            queryParams: { onlyErrors: this.onlyErrors(), sortColumn: this.sortColumn(), sortDirection: this.sortDirection() },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected onOpenErrorMessage(element: StatusActivityPubEventItem): void {
        this.dialog.open(StatusEventErrorMessageDialog, {
            width: '500px',
            data: element
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
