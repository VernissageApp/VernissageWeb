import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Responsive } from 'src/app/common/responsive';
import { Attachment } from 'src/app/models/attachment';
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
    @Input() users?: LinkableResult<User>;
    private userStatuses = new Map<string, LinkableResult<Status>>();

    constructor(
        private usersService: UsersService,
        private contextStatusesService: ContextStatusesService,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes.users) {
            await this.loadStatuses();
        }
    }

    getStatuses(userName: string | undefined): Status[] {
        if (!userName) {
            return [];
        }

        return this.getLinkableStatuses(userName)?.data ?? [];
    }

    getMainAttachmentSrc(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.smallFile?.url ?? '';
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    getMainAttachmentBlurhash(status: Status): string {
        const mainAttachment = this.getMainAttachment(status);
        return mainAttachment?.blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }

    onStatusClick(userName: string | undefined): void {
        let statuses = this.getLinkableStatuses(userName);
        this.contextStatusesService.setContextStatuses(statuses);
    }

    private getLinkableStatuses(userName: string | undefined): LinkableResult<Status> | undefined {
        if (!userName) {
            return undefined;
        }

        return this.userStatuses.get(userName) ?? undefined;
    }

    private async loadStatuses(): Promise<void> {
        if (!this.users) {
            return;
        }

        for(let user of this.users?.data) {
            if (user.userName) {
                let statuses = await this.usersService.statuses(user.userName);
                statuses.context = ContextTimeline.user;
                statuses.user = user.userName;

                this.userStatuses.set(user.userName, statuses);
            }
        }
    }

    private getMainAttachment(status: Status): Attachment | null {
        const mainStatus = status.reblog ?? status;

        if (!mainStatus.attachments) {
            return null;
        }
    
        if (mainStatus.attachments?.length === 0) {
            return null;
        }
    
        return mainStatus.attachments[0]
    }
}
