import { Component, model, OnDestroy, OnInit, signal } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from 'src/app/services/http/users.service';
import { User } from 'src/app/models/user';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { UserRolesDialog } from 'src/app/dialogs/user-roles-dialog/user-roles.dialog';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';

@Component({
    selector: 'app-users',
    templateUrl: './users.page.html',
    styleUrls: ['./users.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class UsersPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly avatarSize = AvatarSize
    protected readonly role = Role;

    protected search = model('');
    protected onlyLocal = model(false);
    protected isReady = signal(false);
    protected users = signal<PaginableResult<User> | undefined>(undefined);
    protected pageIndex = signal(0);
    protected displayedColumns = signal<string[]>([]);

    private routeParamsSubscription?: Subscription;
    private readonly displayedColumnsHandsetPortrait: string[] = ['avatar', 'userName', 'actions'];
    private readonly displayedColumnsHandsetLandscape: string[] = ['avatar', 'userName', 'createdAt', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['avatar', 'userName', 'email', 'isApproved', 'lastLoginDate', 'createdAt', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['avatar', 'userName', 'email', 'isLocal', 'isApproved', 'statuses', 'lastLoginDate', 'createdAt', 'actions'];
    
    constructor(
        private authorizationService: AuthorizationService,
        private usersService: UsersService,
        private loadingService: LoadingService,
        private messageService: MessagesService,
        private randomGeneratorService: RandomGeneratorService,
        private activatedRoute: ActivatedRoute,
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
            const local = params['onlyLocal'] as string;

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex.set(page);
            this.search.set(query);
            this.onlyLocal.set(local === 'true');

            const downloadedUsers = await this.usersService.get(page + 1, size, query, this.onlyLocal());
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
            queryParams: { query: this.search(), onlyLocal: this.onlyLocal() },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected onSetRoles(user: User): void {
        this.dialog.open(UserRolesDialog, {
            width: '500px',
            data: user
        });
    }

    protected async onSetEnable(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.enable(user.userName);

                user.isBlocked = false;
                this.messageService.showSuccess('Account has been enabled.');
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
                this.messageService.showSuccess('Account has been disabled.');
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
                this.messageService.showSuccess('Account has been approved.');
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
                this.messageService.showSuccess('Account has been rejected.');

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

    protected async onUserRefresh(user: User): Promise<void> {
        try {
            if (user.userName) {
                await this.usersService.refresh(user.userName);
                this.messageService.showSuccess('Account has been refreshed.');

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
            data: 'Do you want to delete user account?'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result?.confirmed) {
                try {
                    if (user.userName) {
                        await this.usersService.delete(user.userName);
                        this.messageService.showSuccess('Account has been deleted.');
        
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
