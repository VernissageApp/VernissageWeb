import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Responsive } from 'src/app/common/responsive';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { User } from 'src/app/models/user';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-users-gallery',
    templateUrl: './users-gallery.component.html',
    styleUrls: ['./users-gallery.component.scss'],
    animations: fadeInAnimation
})
export class UsersGalleryComponent extends Responsive implements OnChanges {
    private readonly numberOfVisibleUsersChunk = 10;
    private readonly numberOfVisibleStatuses = 10;

    @Input() users?: LinkableResult<User>;

    private userStatuses = new Map<string, LinkableResult<Status>>();
    private numberOfVisibleUsers = this.numberOfVisibleUsersChunk;
    protected visibleUsers: User[] = [];

    constructor(
        private usersService: UsersService,
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes.users) {
            this.numberOfVisibleUsers = this.numberOfVisibleUsersChunk;
            await this.loadStatuses();
        }
    }

    trackByFn(_: number, item: Status): string | undefined{
        return item.id;
    }

    trackByUserFn(_: number, item: User): string | undefined{
        return item.userName;
    }

    getStatuses(userName: string | undefined): Status[] {
        if (!userName) {
            return [];
        }

        return this.getLinkableStatuses(userName)?.data ?? [];
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    onStatusClick(userName: string | undefined): void {
        let statuses = this.getLinkableStatuses(userName);
        this.contextStatusesService.setContextStatuses(statuses);
    }

    async onNearEndScroll(): Promise<void> {
        this.numberOfVisibleUsers = this.numberOfVisibleUsers + this.numberOfVisibleUsersChunk;
        await this.loadStatuses();
    }

    private getLinkableStatuses(userName: string | undefined): LinkableResult<Status> | undefined {
        if (!userName) {
            return undefined;
        }

        return this.userStatuses.get(userName) ?? undefined;
    }

    private async loadStatuses(): Promise<void> {
        if (!this.users || this.users.data?.length === 0) {
            this.visibleUsers = [];
            return;
        }

        this.visibleUsers = this.users?.data.slice(0, this.numberOfVisibleUsers);

        for (let user of this.visibleUsers) {
            if (user.userName) {
                if (this.userStatuses.has(user.userName)) {
                    continue;
                }

                let statuses = await this.usersService.statuses(user.userName, undefined, undefined, undefined, this.numberOfVisibleStatuses);
                statuses.context = ContextTimeline.user;
                statuses.user = user.userName;

                this.userStatuses.set(user.userName, statuses);
            }
        }
    }
}
