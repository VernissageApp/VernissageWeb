import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Notification } from '../../models/notification';
import { NotificationsService } from 'src/app/services/http/notifications.service';
import { Status } from 'src/app/models/status';
import { NotificationType } from 'src/app/models/notification-type';
import { LoadingService } from 'src/app/services/common/loading.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    animations: fadeInAnimation
})
export class NotificationsPage extends Responsive {
    readonly notificationType = NotificationType;

    isReady = false;
    notifications?: Notification[];

    constructor(
        private notificationsService: NotificationsService,
        private loadingService: LoadingService,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.loadingService.showLoader();
        this.notifications = await this.notificationsService.get();
        this.isReady = true;
        this.loadingService.hideLoader();
    }

    getAttachemntUrl(status: Status): string | undefined {
        if (status.attachments && status.attachments.length > 0) {
            return status.attachments[0].smallFile?.url;
        }

        return undefined
    }

    trackByFn(_: number, notification: Notification): string | undefined {
        return notification.id;
     }
}
