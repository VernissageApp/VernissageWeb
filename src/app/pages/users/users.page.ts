import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { ForbiddenError } from 'src/app/errors/forbidden-error';
import { MessagesService } from 'src/app/services/common/messages.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Role } from 'src/app/models/role';
import { PagedResult } from 'src/app/models/paged-result';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from 'src/app/services/http/users.service';
import { User } from 'src/app/models/user';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { UserRolesDialog } from 'src/app/dialogs/user-roles-dialog/user-roles.dialog';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { MatCard, MatCardContent } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { AvatarComponent } from '../../components/widgets/avatar/avatar.component';
import { MatChipSet, MatChipOption } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
    selector: 'app-users',
    templateUrl: './users.page.html',
    styleUrls: ['./users.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCard, MatCardContent, FormsModule, MatFormField, InputActivityDirective, MatInput, MatLabel, MatSelect, MatOption, MatButton, MatCheckbox, MatRadioGroup, MatRadioButton, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, RouterLink, AvatarComponent, MatChipSet, MatChipOption, MatIcon, MatTooltip, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, TranslatePipe, LocalizedDatePipe]
})
export class UsersPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly avatarSize = AvatarSize
    protected readonly role = Role;

    protected search = model('');
    protected sortColumn = model('createdAt');
    protected sortDirection = model('descending');
    protected onlyLocal = model(false);
    protected onlyBlocked = model(false);
    protected onlySuppressed = model(false);
    protected isReady = signal(false);
    protected users = signal<PagedResult<User> | undefined>(undefined);
    protected pageIndex = signal(0);
    protected displayedColumns = signal<string[]>([]);

    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['avatar', 'userName', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['avatar', 'userName', 'createdAt', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['avatar', 'userName', 'isApproved', 'lastLoginDate', 'createdAt', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['avatar', 'userName', 'isLocal', 'isApproved', 'emailWasConfirmed', 'statuses', 'lastLoginDate', 'createdAt', 'actions'];

    private authorizationService = inject(AuthorizationService);
    private usersService = inject(UsersService);
    private loadingService = inject(LoadingService);
    private messageService = inject(MessagesService);
    private randomGeneratorService = inject(RandomGeneratorService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private dialog = inject(MatDialog);
    private translateService = inject(TranslateService);

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
            const local = params['onlyLocal'] as string;
            const blocked = params['onlyBlocked'] as string;
            const suppressed = params['onlySuppressed'] as string;
            const sortColumn = params['sortColumn'] as string;
            const sortDirection = params['sortDirection'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);
            this.search.set(query);
            this.onlyLocal.set(local === 'true');
            this.onlyBlocked.set(blocked === 'true');
            this.onlySuppressed.set(suppressed === 'true');
            this.sortColumn.set(sortColumn ?? 'createdAt');
            this.sortDirection.set(sortDirection === 'ascending' ? 'ascending' : 'descending');

            const downloadedUsers = await this.usersService.get(page + 1, size, query, this.onlyLocal(), this.onlyBlocked(), this.onlySuppressed(), this.sortColumn(), this.sortDirection());
            this.users.set(downloadedUsers);

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
            queryParams: {
                query: this.search(),
                onlyLocal: this.onlyLocal(),
                onlyBlocked: this.onlyBlocked(),
                onlySuppressed: this.onlySuppressed(),
                sortColumn: this.sortColumn(),
                sortDirection: this.sortDirection() 
            },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected onSetRoles(user: User): void {
        const dialogRef = this.dialog.open(UserRolesDialog, {
            width: '500px',
            data: user
        });
     
        dialogRef.afterClosed().subscribe(async () => {
            const navigationExtras: NavigationExtras = {
                queryParams: { t: this.randomGeneratorService.generateString(8) },
                queryParamsHandling: 'merge'
            };
    
            await this.router.navigate([], navigationExtras);
        });
    }

    protected async onSetEnable(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.enable(user.userName);

                user.isBlocked = false;
                this.messageService.showSuccess(user.isLocal
                    ? this.translateService.instant('pages.users.messages.accountEnabled')
                    : this.translateService.instant('pages.users.messages.userUnblocked'));
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onSetDisable(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.disable(user.userName);

                user.isBlocked = true;
                this.messageService.showSuccess(user.isLocal
                    ? this.translateService.instant('pages.users.messages.accountDisabled')
                    : this.translateService.instant('pages.users.messages.userBlocked'));
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onSuppress(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.suppress(user.userName);

                user.isSuppressed = true;
                this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountSuppressed'));
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onUnsuppress(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.unsuppress(user.userName);

                user.isSuppressed = false;
                this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountUnsuppressed'));
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onSetSupporter(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.supporter(user.userName);

                user.isSupporter = true;
                this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountMarkedAsSupporter'));
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onSetNotSupporter(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.notSupporter(user.userName);

                user.isSupporter = false;
                this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountMarkedAsNotSupporter'));
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onApprove(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.approve(user.userName);

                user.isApproved = true;
                this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountApproved'));
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onReject(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.reject(user.userName);
                this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountRejected'));

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

    protected async onDisableTwoFactor(user: User): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: this.translateService.instant('pages.users.confirmations.disableUserTwoFactor')
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    if (user.userName) {
                        await this.usersService.disableTwoFactorAuthentication(user.userName);
                        this.messageService.showSuccess(this.translateService.instant('pages.users.messages.twoFactorDisabled'));
        
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

    protected async onUserRefresh(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.refresh(user.userName);
                this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountRefreshed'));

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

    protected async onDelete(user: User): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '500px',
            data: this.translateService.instant('pages.users.confirmations.deleteUserAccount')
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    if (user.userName) {
                        await this.usersService.delete(user.userName);
                        this.messageService.showSuccess(this.translateService.instant('pages.users.messages.accountDeleted'));
        
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

    private isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    private isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }
}
