import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Notification } from '../../models/notification';
import { NotificationsService } from 'src/app/services/http/notifications.service';
import { Status } from 'src/app/models/status';
import { NotificationType } from 'src/app/models/notification-type';
import { LoadingService } from 'src/app/services/common/loading.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { LinkableResult } from 'src/app/models/linkable-result';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { SwPush } from '@angular/service-worker';
import { SettingsService } from 'src/app/services/http/settings.service';
import { NotificationSettingsDialog } from 'src/app/dialogs/notification-settings-dialog/notification-settings.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    animations: fadeInAnimation
})
export class NotificationsPage extends Responsive {
    readonly notificationType = NotificationType;
    readonly avatarSize = AvatarSize;

    isReady = false;
    showLoadMore = true;
    showEnableNotificationButton = false;
    notifications?: LinkableResult<Notification>;
    readonly publicVapidServerKey = 'BDQQTUwZW-E2Dw8Yy7NtosI67Chw4YEBsSDCt95PSUZxBU4D4KSVMTsNaDYb7O3BvtR9TvGjb4ZWz4vweh2i2u4';

    constructor(
        private notificationsService: NotificationsService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private swPushService: SwPush,
        public dialog: MatDialog,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.loadingService.showLoader();
        await this.onLoadMore();

        if (this.notifications?.data.length) {
            await this.notificationsService.marker(this.notifications.data[0].id);
            this.notificationsService.changes.next(0);
        }

        this.showEnableNotificationButton = this.swPushService.isEnabled && !!this.settingsService.publicSettings?.webPushVapidPublicKey;

        this.isReady = true;
        this.loadingService.hideLoader();
    }

    async onLoadMore(): Promise<void> {
        const internalNotifications = await this.notificationsService.get(undefined, this.notifications?.maxId, undefined);

        if (this.notifications) {
            if (internalNotifications.data.length > 0) {
                this.notifications.data.push(...internalNotifications.data);
                this.notifications.minId = internalNotifications.minId;
                this.notifications.maxId = internalNotifications.maxId;
            } else {
                this.showLoadMore = false;
            }
        } else {
            this.notifications = internalNotifications;

            if (this.notifications.data.length === 0) {
                this.showLoadMore = false;
            }
        }

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

    openNotificationsSettings(): void {
        this.dialog.open(NotificationSettingsDialog, {
            width: '500px'
        });
    }
}
