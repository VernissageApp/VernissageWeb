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
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from 'src/app/services/http/users.service';
import { User } from 'src/app/models/user';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { UserRolesDialog } from 'src/app/dialogs/user-roles-dialog/user-roles.dialog';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.page.html',
    styleUrls: ['./users.page.scss'],
    animations: fadeInAnimation
})
export class UsersPage extends ResponsiveComponent implements OnInit {
    readonly avatarSize = AvatarSize
    readonly role = Role;

    isReady = false;
    pageIndex = 0;
    users?: PaginableResult<User>;
    displayedColumns: string[] = [];
    routeParamsSubscription?: Subscription;

    private readonly displayedColumnsHandsetPortrait: string[] = ['avatar', 'userName', 'actions'];
    private readonly displayedColumnsHandserLandscape: string[] = ['avatar', 'userName', 'createdAt', 'actions'];
    private readonly displayedColumnsTablet: string[] = ['avatar', 'userName', 'userFullName', 'email', 'isApproved', 'createdAt', 'actions'];
    private readonly displayedColumnsBrowser: string[] = ['avatar', 'userName', 'userFullName', 'email', 'isLocal', 'isApproved', 'statuses', 'createdAt', 'actions'];
    
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

            const page = pageString ? +pageString : 0;
            const size = sizeString ? +sizeString : 10;

            this.pageIndex = page;
            this.users = await this.usersService.get(page + 1, size);

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    onSetRoles(user: User): void {
        this.dialog.open(UserRolesDialog, {
            width: '500px',
            data: user
        });
    }

    async onSetEnable(user: User): Promise<void> {
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

    async onSetDisable(user: User): Promise<void> {
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

    async onApprove(user: User): Promise<void> {
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

    async onReject(user: User): Promise<void> {
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

    isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }
}
