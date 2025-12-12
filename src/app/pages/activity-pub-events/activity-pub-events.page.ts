import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
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
import { StatusActivityPubEvent } from 'src/app/models/status-activity-pub-event';
import { MatDialog } from '@angular/material/dialog';
import { StatusEventErrorMessageDialog } from 'src/app/dialogs/status-event-error-message-dialog/status-event-error-message.dialog';
import { StatusActivityPubEventsService } from 'src/app/services/http/status-activity-pub-events.service';

@Component({
    selector: 'app-activity-pub-events',
    templateUrl: './activity-pub-events.page.html',
    styleUrls: ['./activity-pub-events.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ActivityPubEventsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly avatarSize = AvatarSize
    protected readonly role = Role;

    protected type = model('');
    protected result = model('');
    protected sortColumn = model('createdAt');
    protected sortDirection = model('descending');
    protected isReady = signal(false);
    protected events = signal<PagedResult<StatusActivityPubEvent> | undefined>(undefined);
    protected pageIndex = signal(0);
    protected displayedColumns = signal<string[]>([]);

    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['type', 'result', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['type', 'result', 'user', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['type', 'result', 'user', 'attempts', 'createdAt', 'startAt', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['type', 'result', 'user', 'attempts', 'createdAt', 'startAt', 'endAt', 'actions'];

    private statusActivityPubEventsService = inject(StatusActivityPubEventsService);
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

            if (!this.isAdministrator() && !this.isModerator()) {
                throw new ForbiddenError();
            }

            const pageString = params.queryParams.get('page');
            const sizeString = params.queryParams.get('size');
            const queryType = params.queryParams.get('type');
            const queryResult = params.queryParams.get('result');
            const sortColumn = params.queryParams.get('sortColumn');
            const sortDirection = params.queryParams.get('sortDirection');

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);
            this.type.set(queryType ?? '');
            this.result.set(queryResult ?? '');
            this.sortColumn.set(sortColumn ?? 'createdAt');
            this.sortDirection.set(sortDirection === 'ascending' ? 'ascending' : 'descending');

            const downloadedEvents = await this.statusActivityPubEventsService.events(page + 1, size, this.type(), this.result(), this.sortColumn(), this.sortDirection());
            this.events.set(downloadedEvents);

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
            queryParams: { type: this.type(), result: this.result(), sortColumn: this.sortColumn(), sortDirection: this.sortDirection() },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected onOpenErrorMessage(element: StatusActivityPubEvent): void {
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
