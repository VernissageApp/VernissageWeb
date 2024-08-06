import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { User } from 'src/app/models/user';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-users-gallery-item',
    templateUrl: './users-gallery-item.component.html',
    styleUrls: ['./users-gallery-item.component.scss'],
    animations: fadeInAnimation
})
export class UsersGalleryItemComponent extends ResponsiveComponent {
    private readonly numberOfVisibleStatuses = 10;

    @Input() user!: User;
    statuses?: LinkableResult<Status>;

    constructor(
        private usersService: UsersService,
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    async lazyLoadData(): Promise<void> {
        if (this.user.userName) {
            this.statuses = await this.usersService.statuses(this.user.userName, undefined, undefined, undefined, this.numberOfVisibleStatuses);
        }
    }

    trackByFn(_: number, item: Status): string | undefined{
        return item.id;
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    onStatusClick(): void {
        this.contextStatusesService.setContextStatuses(this.statuses);
    }
}
