import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { User } from 'src/app/models/user';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-users-gallery-item',
    templateUrl: './users-gallery-item.component.html',
    styleUrls: ['./users-gallery-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UsersGalleryItemComponent extends ResponsiveComponent implements OnInit {
    public user = input.required<User>();

    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected alwaysShowNSFW = signal(false);

    private readonly numberOfVisibleStatuses = 10;

    private usersService = inject(UsersService);
    private preferencesService = inject(PreferencesService);
    private contextStatusesService = inject(ContextStatusesService);

    override ngOnInit(): void {
        super.ngOnInit();

        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
    }

    protected async lazyLoadData(): Promise<void> {
        const userInternal = this.user();

        if (userInternal.userName) {
            const downloadedStatuses = await this.usersService.statuses(userInternal.userName, undefined, undefined, undefined, this.numberOfVisibleStatuses);
            this.statuses.set(downloadedStatuses);
        }
    }

    protected getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    protected onStatusClick(): void {
        this.contextStatusesService.setContextStatuses(this.statuses());
    }
}
