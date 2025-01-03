import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Notification } from '../../models/notification';
import { NotificationsService } from 'src/app/services/http/notifications.service';
import { Status } from 'src/app/models/status';
import { NotificationType } from 'src/app/models/notification-type';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { SwPush } from '@angular/service-worker';
import { SettingsService } from 'src/app/services/http/settings.service';
import { NotificationSettingsDialog } from 'src/app/dialogs/notification-settings-dialog/notification-settings.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class NotificationsPage extends ResponsiveComponent implements OnInit {
    protected readonly notificationType = NotificationType;
    protected readonly avatarSize = AvatarSize;

    protected isReady = signal(false);
    protected showLoadMore = signal(true);
    protected showEnableNotificationButton = signal(false);

    protected notifications: WritableSignal<Notification[]> = signal([]);
    protected minId = signal<string | undefined>(undefined);
    protected maxId = signal<string | undefined>(undefined);
    
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
        
        const linkedNotifications = this.notifications();
        if (linkedNotifications?.length) {
            await this.notificationsService.marker(linkedNotifications[0].id);
            this.notificationsService.changes.next(0);
        }
        const isPushApiEnabled = this.notificationsService.isPushApiSupported() && this.swPushService.isEnabled && !!this.settingsService.publicSettings?.webPushVapidPublicKey;
        this.showEnableNotificationButton.set(isPushApiEnabled);

        this.isReady.set(true);
        this.loadingService.hideLoader();
    }

    async onLoadMore(): Promise<void> {
        const internalNotifications = await this.notificationsService.get(undefined, this.maxId(), undefined);

        if (this.notifications()) {
            if (internalNotifications.data.length > 0) {
                this.notifications.update(x => [...x, ...internalNotifications.data]);
                this.minId.set(internalNotifications.minId);
                this.maxId.set(internalNotifications.maxId);
            } else {
                this.showLoadMore.set(false);
            }
        } else {
            this.notifications.set(internalNotifications.data);
            this.minId.set(internalNotifications.minId);
            this.maxId.set(internalNotifications.maxId);

            if (this.notifications().length === 0) {
                this.showLoadMore.set(false);
            }
        }
    }

    getAttachmentUrl(status: Status): string | undefined {
        if (status.attachments && status.attachments.length > 0) {
            return status.attachments[0].smallFile?.url;
        }

        return undefined
    }

    openNotificationsSettings(): void {
        this.dialog.open(NotificationSettingsDialog, {
            width: '500px'
        });
    }

    getNotificationText(notification: Notification): string {
        switch (notification.notificationType) {
            case NotificationType.Mention:
                return 'mentioned you';
            case NotificationType.Status:
                return 'published status';
            case NotificationType.Reblog:
                return 'boost your status';
            case NotificationType.Follow:
                return 'followed you';
            case NotificationType.FollowRequest:
                return 'want to follow you';
            case NotificationType.Favourite:
                return 'favourited your status';
            case NotificationType.Update:
                return 'edited status';
            case NotificationType.AdminSignUp:
                return 'is a new user';
            case NotificationType.AdminReport:
                return 'has been reported';
            case NotificationType.NewComment:
                return 'wrote new comment';
            default:
                return '';
        }
    }

    getNotificationIcon(notification: Notification): string {
        switch (notification.notificationType) {
            case NotificationType.Mention:
                return 'alternate_email';
            case NotificationType.Status:
                return 'fiber_new';
            case NotificationType.Reblog:
                return 'swap_vertical_circle';
            case NotificationType.Follow:
                return 'person_add';
            case NotificationType.FollowRequest:
                return 'person_outline';
            case NotificationType.Favourite:
                return 'star';
            case NotificationType.Update:
                return 'edit';
            case NotificationType.AdminSignUp:
                return 'account_box';
            case NotificationType.AdminReport:
                return 'report_problem';
            case NotificationType.NewComment:
                return 'chat_bubble';
            default:
                return '';
        }
    }

    getNotificationIconClass(notification: Notification): string {
        switch (notification.notificationType) {
            case NotificationType.Mention:
                return 'mention';
            case NotificationType.Status:
                return 'status';
            case NotificationType.Reblog:
                return 'reblog';
            case NotificationType.Follow:
                return 'follow';
            case NotificationType.FollowRequest:
                return 'follow-request';
            case NotificationType.Favourite:
                return 'favourite';
            case NotificationType.Update:
                return 'update';
            case NotificationType.AdminSignUp:
                return 'admin-sign-up';
            case NotificationType.AdminReport:
                return 'admin-report';
            case NotificationType.NewComment:
                return 'new-comments';
            default:
                return '';
        }
    }
}
